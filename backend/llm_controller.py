import info_retriever as ir
from dotenv import load_dotenv
import os
import openai
import cohere
import datetime
from pprint import pprint
import json
import yfinance as yf
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm
import hnswlib
from typing import List, Dict
from unstructured.partition.html import partition_html
from unstructured.chunking.title import chunk_by_title


load_dotenv()
COHERE_API_KEY = os.getenv("COHERE_API_KEY")
PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")

co = cohere.Client(COHERE_API_KEY,
                   log_warning_experimental_features=False)

perclient = openai.OpenAI(api_key=PERPLEXITY_API_KEY, base_url="https://api.perplexity.ai")


def get_stock_ticker_and_range(prompt):
    today = datetime.datetime.now().strftime("%Y-%m-%d")
    
    ticker = co.chat(
        model="command-r-plus",
        preamble="you are going to return only the ticker for the company that the user is asking about. The ticker should be formatted with MAX 4 characters and MIN 2 characters",
        message=prompt,
        connectors=[{"id": "web-search"}]
    )
    
    pprint(ticker.text)
    
    response = co.chat(
    model="command-r-plus",
    preamble=f"I want you to generate a JSON that represents a query that the user made about a company's stock with ticker, formatted with MAX 4 characters and MIN 2 characters, and the start and end date of the query formatted as YYYY-MM-DD. Today is going to be the date {today} if there is no end date known, do the last year.",
    message=f"{prompt} this information will help you get the ticker: {ticker.text}", 
    response_format={
            "type": "json_object",
            "schema": {
                "type": "object",
                "required": ["tickers", "start-date", "end-date"],
                "properties": {
                    "tickers": { "type": "array" },
                    "start-date": { "type": "string"},
                    "end-date": { "type": "string" }
                }
            }
        },
    # connectors= [{"id": "web-search"}]
    )
    
    response = json.loads(response.text)
    
    return response["tickers"], response["start-date"], response["end-date"]

def get_stock_data(prompt):
    
    ticker, start_date, end_date = get_stock_ticker_and_range(prompt)
    loaded_data = yf.download(ticker, start=start_date, end=end_date)

    return loaded_data


class Vectorstore:
    def __init__(self, raw_documents: List[Dict[str, str]]):
        self.raw_documents = raw_documents
        self.docs = []
        self.docs_embs = []
        self.retrieve_top_k = 15
        self.rerank_top_k = 5
        self.load_and_chunk()
        self.embed()
        self.index()

    def load_and_chunk(self) -> None:
        print("Loading documents...")
        
        def process_document(raw_document):
            if "url" in raw_document:
                return self.process_url_document(raw_document)
            else:
                return self.process_text_document(raw_document)

        with ThreadPoolExecutor() as executor:
            future_to_doc = {executor.submit(process_document, doc): doc for doc in self.raw_documents}
            
            for future in tqdm(as_completed(future_to_doc), total=len(self.raw_documents), desc="Processing documents"):
                self.docs.extend(future.result())

    def process_url_document(self, raw_document):
        try:
            elements = partition_html(url=raw_document["url"], headers={"User-Agent": ir.IDENTITY})
            chunks = chunk_by_title(elements)
            return [
                {
                    "title": raw_document["title"],
                    "text": str(chunk),
                    "url": raw_document["url"],
                }
                for chunk in chunks
            ]
        except Exception as e:
            print(f"Error loading URL document: {e}")
            return []

    def process_text_document(self, raw_document):
        try:
            chunks = self.chunk_text(raw_document["text"])
            return [
                {
                    "title": raw_document["title"],
                    "text": chunk,
                }
                for chunk in chunks
            ]
        except Exception as e:
            print(f"Error processing text document: {e}")
            return []

    def chunk_text(self, text, max_chunk_size=1000):
        words = text.split()
        chunks = []
        current_chunk = []
        current_size = 0

        for word in words:
            if current_size + len(word) > max_chunk_size and current_chunk:
                chunks.append(" ".join(current_chunk))
                current_chunk = []
                current_size = 0
            current_chunk.append(word)
            current_size += len(word) + 1  # +1 for space

        if current_chunk:
            chunks.append(" ".join(current_chunk))

        return chunks

    def embed(self) -> None:
        print("Embedding document chunks...")

        batch_size = 90
        self.docs_len = len(self.docs)
        for i in range(0, self.docs_len, batch_size):
            if i % 90 == 0:
                print(f"Processing document chunk {i} of {self.docs_len}...")
            batch = self.docs[i : min(i + batch_size, self.docs_len)]
            texts = [item["text"] for item in batch]
            docs_embs_batch = co.embed(
                texts=texts, model="embed-english-v3.0", input_type="search_document"
            ).embeddings
            self.docs_embs.extend(docs_embs_batch)

    def index(self) -> None:
        print("Indexing document chunks...")

        self.idx = hnswlib.Index(space="ip", dim=1024)
        self.idx.init_index(max_elements=self.docs_len, ef_construction=512, M=64)
        self.idx.add_items(self.docs_embs, list(range(len(self.docs_embs))))

        print(f"Indexing complete with {self.idx.get_current_count()} document chunks.")

    def retrieve(self, query: str) -> List[Dict[str, str]]:
        query_emb = co.embed(
            texts=[query], model="embed-english-v3.0", input_type="search_query"
        ).embeddings
        
        doc_ids = self.idx.knn_query(query_emb, k=self.retrieve_top_k)[0][0]

        rank_fields = ["title", "text"]

        docs_to_rerank = [self.docs[doc_id] for doc_id in doc_ids]
        rerank_results = co.rerank(
            query=query,
            documents=docs_to_rerank,
            top_n=self.rerank_top_k,
            model="rerank-english-v3.0",
            rank_fields=rank_fields
        )

        doc_ids_reranked = [doc_ids[result.index] for result in rerank_results.results]

        docs_retrieved = []
        for doc_id in doc_ids_reranked:
            retrieved_doc = {
                "title": self.docs[doc_id]["title"],
                "text": self.docs[doc_id]["text"],
            }
            if "url" in self.docs[doc_id]:
                retrieved_doc["url"] = self.docs[doc_id]["url"]
            docs_retrieved.append(retrieved_doc)

        return docs_retrieved

raw_documents = []

print("Getting filings for ")
raw_documents += ir.get_all_filings("NVDA")
print("Getting Benzinga news for ")
raw_documents += ir.get_benzinga_news("NVDA")
print("Getting Yahoo news for ")
raw_documents += ir.get_yahoo_news("NVDA")
vectorstore = Vectorstore(raw_documents=raw_documents)

def run_chatbot(message, chat_history=[]):
    print("Using perplexity to generate response...")
    
    preamble="I want you to generate a response to the user's message. you can only use the information that the user has given you in the message. you can't use any external information. you must generate a response that is relevant to the user's message. you cannot generate a response that is irrelevant to the user's message. But you MUST add a citations section at the end, always labeled as CITATIONS, and you MUST add a CITED DOCUMENTS section at the end, always labeled as CITED DOCUMENTS.",
    
    # Generate search queries, if any        
    response = co.chat(message=message,
                        model="command-r-plus",
                        search_queries_only=True,
                        chat_history=chat_history)
    
    search_queries = []
    for query in response.search_queries:
        search_queries.append(query.text)
    
    # messages = [
    #     {
    #         "role": "system",
    #         "content": preamble
    #         },
    #     {
    #         "role": "user",
    #         "content": message
    #     }
    # ]
    messages = [
    {
        "role": "system",
        "content": (
            f"You are an artificial intelligence assistant and you need to engage in a helpful, detailed, polite conversation with a user. {preamble}"
        ),
    },
    {
        "role": "user",
        "content": (
            str(message)
        ),
    },
]

    # If there are search queries, retrieve the documents
    if search_queries:
        print("Retrieving information...", end="")

        # Retrieve document chunks for each query
        documents = []
        for query in search_queries:
            documents.extend(vectorstore.retrieve(query))
        print(documents)

        # Use document chunks to respond
        # response = co.chat_stream(
        #     preamble="I want you to generate a response to the user's message. you can only use the information that the user has given you in the message. you can't use any external information. you must generate a response that is relevant to the user's message. you cannot generate a response that is irrelevant to the user's message.",
        #     message=message,
        #     model="command-r-plus",
        #     documents=documents,
        #     chat_history=chat_history,
        # )
        
        messages = [
    {
        "role": "system",
        "content": (
            f"You are an artificial intelligence assistant and you need to engage in a helpful, detailed, polite conversation with a user. {preamble}"
        ),
    },
    {
        "role": "user",
        "content": (
            f"{message} you may use the following information to generate a response but you should generate and use your own sources: {documents}"
        ),
    },
]
        
        response = perclient.chat.completions.create(
            model="llama-3.1-sonar-large-128k-online",
            messages=messages
        )
        pprint(response.choices[0].message)

    else:
        response = perclient.chat.completions.create(
            model="llama-3.1-sonar-large-128k-online",
            messages=messages
        )
        pprint(response.choices[0].message)
        
    
# run_chatbot("What is the latest news on NVDA?")