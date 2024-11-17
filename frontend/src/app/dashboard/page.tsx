"use client";

import { useState, useRef, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { ModeToggle } from "@/app/components/ui/mode-toggle";
import { useTheme } from "next-themes";
import { useRouter, useSearchParams } from "next/navigation";


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type Message = {
  text: string;
  isUser: boolean;
};

const API_KEY = "e1b4cf3fe5af0f1128726818c9fbb000"; // Replace with your Marketstack API key
// const searchParams = useSearchParams();
// const stocksParam = searchParams.get("stocks");
// const STOCK_SYMBOLS = stocksParam ? stocksParam.split(",") : [];
// // const STOCK_SYMBOLS = ["AAPL", "GOOGL", "MSFT"]; // Customize stock symbols
// const COLORS = ["rgb(255, 99, 132)", "rgb(54, 162, 235)", "rgb(75, 192, 192)"]; // Unique colors for each stock

export default function Dashboard() {
  const searchParams = useSearchParams();
  const stocksParam = searchParams.get("stocks");
  const STOCK_SYMBOLS = stocksParam ? stocksParam.split(",") : [];
  // const STOCK_SYMBOLS = ["AAPL", "GOOGL", "MSFT"]; // Customize stock symbols
  const COLORS = ["rgb(255, 99, 132)", "rgb(54, 162, 235)", "rgb(75, 192, 192)"]; // Unique colors for each stock
  const [stocksData, setStocksData] = useState<
    { symbol: string; name: string; price: number; change: number; historicalData: any[] }[]
  >([]);
  const [chartData, setChartData] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const { theme } = useTheme();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Fetch Marketstack data
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
            date: new Date(entry.date).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" }), // Format date
            close: entry.close, // Closing price
          }));

          return {
            symbol,
            name: symbol, // Use symbol name; replace with API-provided names if available
            price: historicalData[0]?.close || 0,
            change:
              historicalData.length > 1
                ? ((historicalData[0]?.close - historicalData[1]?.close) / historicalData[1]?.close) * 100
                : 0,
            historicalData,
          };
        });

        const stocks = await Promise.all(promises);

        // Update stocks data
        setStocksData(stocks);

        // Generate chart data
        const labels = [...new Set(stocks.flatMap((stock) => stock.historicalData.map((d) => d.date)))].sort();
        const datasets = stocks.map((stock, index) => ({
          label: stock.symbol,
          data: labels.map(
            (label) => stock.historicalData.find((d) => d.date === label)?.close || null
          ),
          borderColor: COLORS[index % COLORS.length], // Assign unique color
          backgroundColor: COLORS[index % COLORS.length] + "80", // Semi-transparent background
          tension: 0.1,
        }));

        setChartData({
          labels,
          datasets,
        });
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    fetchStockData();
  }, [theme]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const userMessage: Message = { text: inputMessage, isUser: true };
      const aiMessage: Message = { text: "Hello! How can I assist you with your stocks today?", isUser: false };
      setChatMessages([...chatMessages, userMessage, aiMessage]);
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
                {message.text}
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
          />
          <Button onClick={handleSendMessage}>Send</Button>
        </div>
      </div>
    </div>
  );
}
