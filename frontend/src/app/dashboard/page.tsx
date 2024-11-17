"use client";

import { useState, useRef, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { ModeToggle } from "@/app/components/ui/mode-toggle";
import { useTheme } from "next-themes";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const API_KEY = process.env.NEXT_PUBLIC_MS_API_KEY;

type Message = {
  text: string;
  isUser: boolean;
};

export default function Dashboard() {
  const searchParams = useSearchParams();
  const stocksParam = searchParams.get("stocks");
  const STOCK_SYMBOLS = stocksParam ? stocksParam.split(",") : [];
  const COLORS = ["rgb(255, 99, 132)", "rgb(54, 162, 235)", "rgb(75, 192, 192)"];
  const [stocksData, setStocksData] = useState<
    { symbol: string; name: string; price: number; change: number; historicalData: any[] }[]
  >([]);
  const [chartData, setChartData] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Utility function to process citations in chatbot responses
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

  // Fetch stock data
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const promises = STOCK_SYMBOLS.map(async (symbol) => {
          const url = `https://api.marketstack.com/v1/eod?access_key=${API_KEY}&symbols=${symbol}`;
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error(`Error fetching data for ${symbol}`);
          }

          const data = await response.json();
          const historicalData = data.data.map((entry: any) => ({
            date: new Date(entry.date).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" }),
            close: entry.close,
          }));

          return {
            symbol,
            name: symbol,
            price: historicalData[0]?.close || 0,
            change:
              historicalData.length > 1
                ? ((historicalData[0]?.close - historicalData[1]?.close) / historicalData[1]?.close) * 100
                : 0,
            historicalData,
          };
        });

        const stocks = await Promise.all(promises);

        setStocksData(stocks);

        const labels = [...new Set(stocks.flatMap((stock) => stock.historicalData.map((d) => d.date)))].sort();
        const datasets = stocks.map((stock, index) => ({
          label: stock.symbol,
          data: labels.map(
            (label) => stock.historicalData.find((d) => d.date === label)?.close || null
          ),
          borderColor: COLORS[index % COLORS.length],
          backgroundColor: `${COLORS[index % COLORS.length]}80`,
          tension: 0.1,
        }));

        setChartData({ labels, datasets });
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    fetchStockData();
  }, [STOCK_SYMBOLS]);

  // Handle chatbot message submission
  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      const userMessage: Message = { text: inputMessage, isUser: true };
      setChatMessages([...chatMessages, userMessage]);
      setIsLoading(true);

      try {
        const response = await fetch("http://localhost:8080/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
        };
        setChatMessages((prevMessages) => [...prevMessages, aiMessage]);
      } catch (error) {
        console.error("Error:", error);
        const errorMessage: Message = { text: "Sorry, I couldn't process your request.", isUser: false };
        setChatMessages((prevMessages) => [...prevMessages, errorMessage]);
      } finally {
        setIsLoading(false);
      }

      setInputMessage("");
    }
  };

  // Scroll chatbot container to the bottom when messages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Historical Stock Performance",
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Left side - Stocks and Graph */}
      <div className="w-2/3 p-6 overflow-y-auto border-r border-gray-600/30 dark:border-gray-400/30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Your Stocks</h2>
          <ModeToggle />
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {stocksData.map((stock) => (
            <div
              key={stock.symbol}
              className="bg-card text-card-foreground p-4 rounded-lg shadow border border-gray-600/30 dark:border-gray-400/30"
            >
              <h3 className="font-bold">{stock.symbol}</h3>
              <p>{stock.name}</p>
              <p className="text-lg">${stock.price.toFixed(2)}</p>
              <p
                className={
                  stock.change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                }
              >
                {stock.change >= 0 ? "+" : ""}
                {stock.change.toFixed(2)}%
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
        <div
          ref={chatContainerRef}
          className="flex-grow overflow-y-auto mb-4 space-y-4 border border-gray-600/30 dark:border-gray-400/30 rounded-lg p-4"
        >
          {chatMessages.map((message, index) => (
            <div key={index} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  message.isUser
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-200 dark:bg-gray-700 rounded-bl-none"
                }`}
              >
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{message.text}</ReactMarkdown>
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
    </div>
  );
}
