from edgar import Company, find, set_identity, get_filings
import pandas as pd
import datetime as dt
from dotenv import load_dotenv
import os
import requests
from bs4 import BeautifulSoup

load_dotenv()
IDENTITY = os.getenv("EDGAR_EMAIL")
set_identity(IDENTITY)

print("FILING RETRIEIVER LOADED")

ALPACA_API_KEY = os.getenv("ALPACA_API_KEY")
ALPACA_SECRET_KEY = os.getenv("ALPACA_SECRET_KEY")

print("NEWS RETRIEVER LOADED")

def get_top_thirteen_f_helper():
    # current year
    year = dt.datetime.now().year
    # current quarter
    quarter = (dt.datetime.now().month - 1) // 3 + 1
    filings = get_filings(form="13F-HR", year=year, quarter=quarter)
    filings = filings.to_pandas()
    filings = filings[filings['company'].str.contains('PARAGON CAPITAL MANAGEMENT INC|BlackRock Inc.|STATE STREET CORP|VANGUARD GROUP INC|RENAISSANCE TECHNOLOGIES LLC', case=False)]
    # only select unique companies
    filings = filings.drop_duplicates(subset=['company'])
    # make a map of company names to accessions
    company_to_accession = filings.set_index('company')['accession_number'].to_dict()
    # get the holdings for each company
    holdings = {}
    for company, accession in company_to_accession.items():
        print(f"Getting holdings for {company}")
        holdings[company] = find(accession).obj().infotable.to_dict()
        
    return holdings

# thirteen_f_holdings = get_top_thirteen_f_helper()
thirteen_f_holdings = {}
def get_top_thirteen_f():
    return thirteen_f_holdings if thirteen_f_holdings else {}

def get_earnings_report(ticker, year, quarter):
    report = "10-Q"
    if quarter == 4:
        report = "10-K"
    
    company = Company(ticker)
    filings_df = company.get_filings(form=report).to_pandas()
    filings_df["filing_date"] = pd.to_datetime(filings_df["filing_date"])
    # check if the year is correct
    filings_df = filings_df[filings_df["filing_date"].dt.year == year]
    # check if the quarter is correct
    filings_df = filings_df[filings_df["filing_date"].dt.quarter == quarter]
    # print the year and quarter of the filing
    print(filings_df["filing_date"].iloc[0].year)
    print(filings_df["filing_date"].iloc[0].quarter)
    # get financial report from the first filing's accession number
    accession_number = filings_df["accession_number"].iloc[0]
    filing = find(accession_number)
    filing_financials = filing.obj()
    financials = {
        "income_statement": filing_financials.income_statement,
        "balance_sheet": filing_financials.balance_sheet,
        "cash_flow_statement": filing_financials.cash_flow_statement
    }
    
    for i in (financials):
        financials[i] = financials[i].to_dataframe().to_dict()
    
    
    return financials


def get_all_filings(ticker, start_date=None, end_date=None):
    # if start_date is None set it to 1 year ago and end_date to today
    if start_date is None and end_date is None:
        end_date = dt.datetime.now()
        start_date = end_date - dt.timedelta(days=365)
    
    print(f"Getting filings for {ticker} between {start_date} and {end_date}")
    
    company = Company(ticker)
    # get all 10-k, 10-q, 8-k (with press release) filings
    filings_df = company.get_filings(form=['10-K', '10-Q', '8-K']).to_pandas()
    
    # set date column to datetime
    filings_df["filing_date"] = pd.to_datetime(filings_df["filing_date"])
    
    # select filings between start_date and end_date
    filings_df = filings_df[(filings_df["filing_date"] >= start_date) & (filings_df["filing_date"] <= end_date)]
    
    # drop extraneous columns
    filings_df.drop(columns=["act", "fileNumber", "isInlineXBRL", "isXBRL", "primaryDocDescription", "acceptanceDateTime", "size", "primaryDocument", "items"], inplace=True)
    
    # sort by form and date
    filings_df.sort_values(by=["form", "filing_date"], inplace=True)
    
    # initialize list to hold all documents
    all_docs = []
    
    # iterate over all filings
    for _, row in filings_df.iterrows():
       filing = find(row["accession_number"])
       filing_obj = filing.obj()
       relevant_items = []
       if filing.form == "10-K":
           relevant_items = ['1', '1A', '5', '6', '7', '7A', '8', '10', '11']
       elif filing.form == "10-Q":
           relevant_items = ['1', '2', '3', '4', '1A', '5']
       elif filing.form == "8-K":
            relevant_items = filing_obj.items
            # remove the "Item " prefix
            relevant_items = [item[5:] for item in relevant_items]
       all_docs.append({
        "title": f'Form {row["form"]}, contains all stock information, very important filed on {row["filing_date"]}',
        # "url": filing.document.url,
        "text": "|".join([filing_obj["ITEM "+item] for item in relevant_items])
        }) 
       
    return all_docs


def get_benzinga_news(tickers, start_date=None, end_date=None):
    if not start_date or not end_date:
        end_date = dt.datetime.now().strftime("%Y-%m-%d")
        start_date = (dt.datetime.now() - dt.timedelta(days=7)).strftime("%Y-%m-%d")
    
    if isinstance(tickers, str):
        tickers = [tickers]
    ticker_string = "%2C".join(tickers) if len(tickers) > 1 else tickers[0]
    
    base_url = f"https://data.alpaca.markets/v1beta1/news?start={start_date}&end={end_date}&sort=desc&symbols={ticker_string}&limit=50&include_content=false"
    headers = {
        "accept": "application/json",
        "APCA-API-KEY-ID": ALPACA_API_KEY,
        "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY
    }
    
    all_news = []
    next_page_token = None
    
    while True:
        url = base_url
        if next_page_token:
            url += f"&page_token={next_page_token}"
        
        response = requests.get(url, headers=headers)
        data = response.json()
        
        if 'news' in data:
            for news in data['news']:
                if set(news["symbols"]) == set(tickers):
                    all_news.append({"title": news["headline"], "url": news["url"]})
        
        next_page_token = data.get('next_page_token')
        if not next_page_token:
            break
    
    return all_news



def get_yahoo_news(ticker):
    URL = f"https://finance.yahoo.com/quote/{ticker}/news/"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    response = requests.get(URL, headers=headers)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # body = soup.find('div', class_='filtered-stories x-large yf-ovk92u rulesBetween infiniteScroll')
    news_list = soup.find_all('li', class_="stream-item yf-ovk92u")
    
    end = min(len(news_list), 25)
    ans = []
    
    for i in range(0, end):
        item = news_list[i]
        title = item.find("h3", class_="clamp yf-1sxfjua").text
        url = item.find("a", class_="subtle-link")["href"]
        # body = item.find("p", class_="clamp yf-1sxfjua").text
        ans.append({
            "title": title,
            "url": url
        })
    
    return ans
