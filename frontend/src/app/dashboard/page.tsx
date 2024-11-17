"use client";

import { useState, useEffect } from "react";
import Chatbot from "@/app/components/ui/chatbot";
import InteractiveChart from "@/app/components/ui/interactive-chart";
import StockCard from "@/app/components/ui/stock-card";

interface HistoricalData {
  date: string;
  [key: string]: number | string; 
}

interface LatestStockData {
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

const STOCK_SYMBOLS = ["AAPL", "GOOGL", "MSFT"];
const API_KEY = "";

export default function DashboardPage() {
  const [chartData, setChartData] = useState<HistoricalData[]>([]); 
  const [stockCardsData, setStockCardsData] = useState<LatestStockData[]>([]); 
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStockData() {
      try {
        const promises = STOCK_SYMBOLS.map(async (symbol) => {
          const url = `https://api.marketstack.com/v1/eod?access_key=${API_KEY}&symbols=${symbol}`;
          const response = await fetch(url);
  
          if (!response.ok) {
            throw new Error(`Error fetching data for ${symbol}: ${response.statusText}`);
          }
  
          const data = await response.json();
  
          if (!data.data || !Array.isArray(data.data)) {
            console.warn(`Invalid data format for ${symbol}`, data);
            return { historicalData: [], latestData: null };
          }
  
          const historicalData = data.data.map((entry: any) => ({
            date: entry.date,
            [symbol]: entry.close,
          }));
  
          const latestEntry = data.data[0];
          const latestData: LatestStockData = {
            symbol: latestEntry.symbol,
            date: latestEntry.date,
            open: latestEntry.open,
            high: latestEntry.high,
            low: latestEntry.low,
            close: latestEntry.close,
          };
  
          return { historicalData, latestData };
        });
  
        const results = await Promise.all(promises);

        const historicalChartData = results.flatMap((result) => result.historicalData);
  
        const latestStockData: LatestStockData[] = results
          .map((result) => result.latestData)
          .filter((data): data is LatestStockData => data !== null); 

        const mergedChartData = historicalChartData.reduce<HistoricalData[]>((acc, stockData) => {
          if (!Array.isArray(stockData)) {
            console.warn("Expected array but got:", stockData);
            return acc;
          }
  
          stockData.forEach((entry) => {
            const existing = acc.find((item) => item.date === entry.date);
            if (existing) {
              Object.assign(existing, entry);
            } else {
              acc.push(entry);
            }
          });
  
          return acc;
        }, []);
  
        setChartData(mergedChartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        setStockCardsData(latestStockData); 
      } catch (err) {
        setError((err as Error).message);
      }
    }
  
    fetchStockData();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex h-screen">
      {}
      <div className="flex flex-col flex-1 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stockCardsData.map((stock) => (
            <StockCard key={stock.symbol} symbol={stock.symbol} data={stock} />
          ))}
        </div>

        {}
        <div className="flex-1">
          <InteractiveChart data={chartData} />
        </div>
      </div>

      {}
      <div className="w-1/3 p-4">
        <Chatbot />
      </div>
    </div>
  );
}
