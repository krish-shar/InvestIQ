"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { PlaceholdersAndVanishInput } from "@/app/components/ui/placeholders-and-vanish-inputs";

export default function GetStartedPage() {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Submitted:", inputValue);
    // Handle the submission logic here
  };

  const placeholders = [
    "Search for any stock...",
    "Enter a stock symbol...",
    "Looking up a company?",
    "Type a ticker symbol...",
    "Find stock insights...",
    "Search for a stock symbol...",
    "Enter a company name or ticker...",
    "What stock are you interested in?",
    "Search stocks here...",
    "Type a stock symbol to analyze...",
    "What stock are you tracking?",
    "Explore a stock...",
    "Enter ticker or company name...",
    "Which stock are you curious about?",
    "Find a stock's performance...",
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex flex-col items-center justify-center h-screen bg-background text-foreground"
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-4xl font-bold mb-8"
      >
        Search for your desired stocks
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="w-full max-w-md"
      >
        <PlaceholdersAndVanishInput
          placeholders={placeholders}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
        />
      </motion.div>
    </motion.div>
  );
}