// getstarted.tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { PlaceholdersAndVanishInput } from "@/app/components/ui/placeholders-and-vanish-inputs";

export default function GetStartedPage() {
  const [selectedStocks, setSelectedStocks] = useState<
    { symbol: string; name: string }[]
  >([]);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Optional: handle input change if needed
  };

  const handleSubmit = (stock: { symbol: string; name: string }) => {
    if (
      selectedStocks.length < 3 &&
      !selectedStocks.some((s) => s.symbol === stock.symbol)
    ) {
      setSelectedStocks([...selectedStocks, stock]);
    }
  };

  const handleRemoveStock = (stock: { symbol: string; name: string }) => {
    setSelectedStocks(selectedStocks.filter((s) => s.symbol !== stock.symbol));
  };

  const handleGenerateAnalysis = () => {
    const stocksParam = selectedStocks
      .map((s) => encodeURIComponent(s.symbol))
      .join(",");
    router.push(`/analysis-loader?stocks=${stocksParam}`);
  };

  const placeholders = [
    "Search for any stock...",
    "Enter a stock symbol...",
    "Looking up a company?",
    "Type a ticker symbol...",
    "Find stock insights...",
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4"
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-4xl font-bold mb-8 text-center"
      >
        Search for your desired stocks
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="w-full max-w-md"
      >
        <PlaceholdersAndVanishInput
          placeholders={placeholders}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          disabled={selectedStocks.length >= 3}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedStocks.map((stock) => (
            <div
              key={stock.symbol}
              className="bg-blue-500 text-white px-3 py-1 rounded-full flex items-center"
            >
              {stock.symbol} - {stock.name || "Unknown Company"}
              <button
                onClick={() => handleRemoveStock(stock)}
                className="ml-2 focus:outline-none hover:text-gray-200 transition-colors"
              >
                <span className="sr-only">Remove</span>
                {/* SVG Close Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="mt-8"
      >
        <button
          onClick={handleGenerateAnalysis}
          className={`px-6 py-3 rounded-lg transition-colors duration-300 ${
            selectedStocks.length > 0
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={selectedStocks.length === 0}
        >
          Generate Analysis
        </button>
      </motion.div>
    </motion.div>
  );
}
