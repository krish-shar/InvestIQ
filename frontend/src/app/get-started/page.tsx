// page.tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { PlaceholdersAndVanishInput } from "@/app/components/ui/placeholders-and-vanish-inputs";

export default function GetStartedPage() {
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Optional: handle input change if needed
  };

  const handleSubmit = (value: string) => {
    if (selectedStocks.length < 3 && !selectedStocks.includes(value)) {
      setSelectedStocks([...selectedStocks, value]);
    }
  };

  const handleRemoveStock = (stock: string) => {
    setSelectedStocks(selectedStocks.filter((s) => s !== stock));
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
              key={stock}
              className="bg-blue-500 text-white px-3 py-1 rounded-full flex items-center"
            >
              {stock}
              <button
                onClick={() => handleRemoveStock(stock)}
                className="ml-2 focus:outline-none hover:text-gray-200 transition-colors"
              >
                <span className="sr-only">Remove</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
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
        <Link href={selectedStocks.length > 0 ? "/dashboard" : "#"} passHref>
          <button
            className={`px-6 py-3 rounded-lg transition-colors duration-300 ${
              selectedStocks.length > 0
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={selectedStocks.length === 0}
          >
            Generate Analysis
          </button>
        </Link>
      </motion.div>
    </motion.div>
  );
}
