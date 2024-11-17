"use client";

import { useState } from "react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";

export default function ChipInput() {
  const [chips, setChips] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() && chips.length < 3) {
      setChips([...chips, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleDeleteChip = (index: number) => {
    setChips(chips.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    alert("hello")
  };

  return (
    <div className="flex items-center justify-center h-screen text-white">
      <div
        className="flex flex-wrap items-center gap-2 w-[400px] px-2 py-1 bg-gray-800 text-white border border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-blue-500"
        onClick={(e) => (e.currentTarget.querySelector("input")?.focus())} 
      >
        {}
        {chips.map((chip, index) => (
          <Badge
            key={index}
            className="h-[40px] flex items-center bg-blue-600 text-white text-sm px-2 py-1 rounded-md"
          >
            <span>{chip}</span>
            <Button
              onClick={() => handleDeleteChip(index)}
              className="ml-2 text-white hover:text-red-500 bg-transparent p-0 border-none focus:outline-none"
            >
              &times;
            </Button>
          </Badge>
        ))}

        {}
        <input
          type="text"
          value={inputValue}
          placeholder={chips.length < 3 ? "Type and press Enter..." : ""}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="h-[40px] flex-grow bg-transparent text-white focus:outline-none"
          disabled={chips.length >= 3} 
        />
      </div>

      <Link href="/dashboard">
        <button className="h-[40px] ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={chips.length === 0} >
            Submit
        </button>
      </Link>
    </div>
  );
}
