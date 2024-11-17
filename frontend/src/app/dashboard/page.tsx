"use client";

import { useState, useRef, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { useTheme } from "next-themes";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const API_KEY = process.env.NEXT_PUBLIC_MS_API_KEY;

type Message = {
  text: string;
  isUser: boolean;
  citations?: string[];
};

type HistoricalData = {
  date: string;
  close: number;
};

type StockData = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  historicalData: HistoricalData[];
};

export default function Dashboard() {
  const searchParams = useSearchParams();
  const stocksParam = searchParams.get("stocks");
  const STOCK_SYMBOLS = stocksParam ? stocksParam.split(",") : [];
  const COLORS = ["rgb(255, 99, 132)", "rgb(54, 162, 235)", "rgb(75, 192, 192)"];

  const [stocksData, setStocksData] = useState<StockData[]>([]);
  const [chartData, setChartData] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const processCitations = (text: string, citations: string[]) => {
    const citationRegex = /\[(\d+)\]/g;
    let processedText = text;
    const usedCitations = new Set<number>();

    processedText = processedText.replace(citationRegex, (match, p1) => {
      const index = parseInt(p1) - 1;
      if (index >= 0 && index < citations.length) {
        usedCitations.add(index);
        return `<sup><a href="${citations[index]}" target="_blank" rel="noopener noreferrer" class="citation-link">[${index + 1}]</a></sup>`;
      }
      return match;
    });

    const groupedCitations = Array.from(usedCitations)
      .sort((a, b) => a - b)
      .map((index) => {
        const url = new URL(citations[index]);
        return `<a href="${citations[index]}" target="_blank" rel="noopener noreferrer" class="citation-link">${url.hostname}</a>`;
      })
      .join(", ");

    if (groupedCitations) {
      processedText += `\n\nSources: ${groupedCitations}`;
    }

    return processedText;
  };
const hasFetched = useRef(false);
useEffect(() => {
  const fetchStockData = async () => {
    try {
      if (STOCK_SYMBOLS.length === 0) {
        console.error("No stock symbols provided.");
        return;
      }

      const symbols = STOCK_SYMBOLS.join(',');
      const url = `/api/stocks?symbols=${symbols}`;

      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorData.error}`);
      }
      const data = await response.json();

      if (data.error) {
        throw new Error(`API error: ${data.error}`);
      }

      const groupedData = STOCK_SYMBOLS.map((symbol) => {
        const stockData = data.data.filter((entry: any) => entry.symbol === symbol);
        if (stockData.length === 0) {
          console.warn(`No data returned for ${symbol}`);
          return null;
        }
        const historicalData = stockData.map((entry: any) => ({
          date: new Date(entry.date).toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
          }),
          close: entry.close,
        })).reverse(); // Reverse to have chronological order

        return {
          symbol,
          name: symbol,
          price: historicalData[historicalData.length - 1]?.close || 0,
          change:
            historicalData.length > 1
              ? ((historicalData[historicalData.length - 1]?.close - historicalData[historicalData.length - 2]?.close) /
                  historicalData[historicalData.length - 2]?.close) *
                100
              : 0,
          historicalData,
        };
      }).filter((stock): stock is StockData => stock !== null);

      setStocksData(groupedData);

      // Prepare chart data
      const labels = [
        ...new Set(groupedData.flatMap((stock) => stock.historicalData.map((d) => d.date))),
      ].sort();
      const datasets = groupedData.map((stock, index) => ({
        label: stock.symbol,
        data: labels.map(
          (label) => stock.historicalData.find((d) => d.date === label)?.close || null
        ),
        borderColor: COLORS[index % COLORS.length],
        backgroundColor: `${COLORS[index % COLORS.length]}80`,
        tension: 0.1,
      }));

      setChartData({ labels, datasets });

    } catch (error: any) {
      console.error("Error fetching stock data:", error.message || error);
    }
  };

   if (!hasFetched.current) {
    hasFetched.current = true;
    fetchStockData();
  }
}, []);


  useEffect(() => {
    const initialAnalysis = localStorage.getItem('initialAnalysis');
    if (initialAnalysis) {
      const data = JSON.parse(initialAnalysis);
      const processedText = processCitations(data.response, data.citations);
      const aiMessage: Message = {
        text: processedText,
        isUser: false,
        citations: data.citations
      };
      setChatMessages([aiMessage]);
      localStorage.removeItem('initialAnalysis');
    } else {
      const welcomeMessage: Message = {
        text: "Hey! Ask me any questions about the stocks you are interested in",
        isUser: false
      };
      setChatMessages([welcomeMessage]);
    }
  }, []);

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      const userMessage: Message = { text: inputMessage, isUser: true };
      setChatMessages((prevMessages) => [...prevMessages, userMessage]);
      setIsLoading(true);

      try {
        const response = await fetch("http://localhost:8080/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: inputMessage }),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        const processedText = processCitations(data.response, data.citations);
        const aiMessage: Message = {
          text: processedText,
          isUser: false,
          citations: data.citations
        };
        setChatMessages((prevMessages) => [...prevMessages, aiMessage]);
      } catch (error) {
        console.error("Error:", error);
        const errorMessage: Message = {
          text: "Sorry, I couldn't process your request.",
          isUser: false
        };
        setChatMessages((prevMessages) => [...prevMessages, errorMessage]);
      } finally {
        setIsLoading(false);
      }

      setInputMessage("");
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Historical Stock Performance" },
    },
    scales: { y: { beginAtZero: false } },
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Left side - Stocks and Graph */}
      <div className="w-2/3 p-6 overflow-y-auto border-r border-gray-600/30 dark:border-gray-400/30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Your Stocks</h2>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {stocksData.map((stock) => (
            <div key={stock.symbol} className="bg-card text-card-foreground p-4 rounded-lg shadow border border-gray-600/30 dark:border-gray-400/30">
              <h3 className="font-bold">{stock.symbol}</h3>
              <p>{stock.name}</p>
              <p className="text-lg">${stock.price.toFixed(2)}</p>
              <p className={stock.change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)}%
              </p>
            </div>
          ))}
        </div>
        {chartData && (
          <div className="bg-card text-card-foreground p-4 rounded-lg shadow border border-gray-600/30 dark:border-gray-400/30">
            <h3 className="text-xl font-bold mb-2">Stock Performance</h3>
            <Line data={chartData} options={chartOptions} />
          </div>
        )}
      </div>

      {/* Right side - Chatbot */}
      <div className="w-1/3 bg-card text-card-foreground p-6 flex flex-col border-l border-gray-600/30 dark:border-gray-400/30">
        <h2 className="text-2xl font-bold mb-4">AI Assistant</h2>
        <div ref={chatContainerRef} className="flex-grow overflow-y-auto mb-4 space-y-4 border border-gray-600/30 dark:border-gray-400/30 rounded-lg p-4">
          {chatMessages.map((message, index) => (
            <div key={index} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-3 rounded-lg ${
                message.isUser ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 rounded-bl-none prose dark:prose-invert'
              }`}>
                <ReactMarkdown
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-bold" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-bold" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                    em: ({node, ...props}) => <em className="italic" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-inside" {...props} />,
                    a: ({node, ...props}) => <a className="text-blue-500 hover:underline" {...props} />,
                  }}
                >
                  {message.text}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Ask about your stocks..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="border-gray-600/30 dark:border-gray-400/30"
            disabled={isLoading}
          />
          <Button onClick={handleSendMessage} disabled={isLoading}>
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>
      <style jsx global>{`
        .citation-link {
          color: #3b82f6 !important;
          text-decoration: none !important;
        }
        .citation-link:hover {
          text-decoration: underline !important;
        }
        .prose a {
          text-decoration: none !important;
        }
        .prose a:hover {
          text-decoration: underline !important;
        }
      `}</style>
    </div>
  );
}