"use client";

import * as React from "react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";

export default function Chatbot() {
  const [messages, setMessages] = React.useState([
    { sender: "bot", text: "Hello! How can I assist you today?" },
  ]);
  const [inputValue, setInputValue] = React.useState("");

  const handleSend = () => {
    if (!inputValue.trim()) return;
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: inputValue.trim() },
    ]);
    setInputValue("");

    // Simulate bot response after a delay
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Thank you for your message!" },
      ]);
    }, 1000);
  };

  return (
    <div
      className="max-h-[90vh] flex flex-col h-screen p-4"
      style={{
        backgroundColor: "hsl(var(--background))",
        color: "hsl(var(--foreground))",
      }}
    >
      {/* Chat messages */}
      <div
        className="flex-1 overflow-y-auto space-y-4 p-4 shadow rounded-lg"
        style={{
          backgroundColor: "hsl(var(--card))",
          color: "hsl(var(--card-foreground))",
        }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-xs ${
                message.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
              style={{
                backgroundColor: message.sender === "user" 
                  ? "hsl(var(--primary))" 
                  : "hsl(var(--muted))",
                color: message.sender === "user"
                  ? "hsl(var(--primary-foreground))"
                  : "hsl(var(--muted-foreground))",
              }}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>

      {/* Chat input */}
      <div
        className="flex items-center gap-2 p-4 border-t shadow"
        style={{
          backgroundColor: "hsl(var(--popover))",
          color: "hsl(var(--popover-foreground))",
        }}
      >
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
          style={{
            backgroundColor: "hsl(var(--input))",
            color: "hsl(var(--foreground))",
            borderColor: "hsl(var(--border))",
          }}
        />
        <Button
          onClick={handleSend}
          style={{
            backgroundColor: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
          }}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
