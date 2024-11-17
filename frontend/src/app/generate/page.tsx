// app/new-page/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";

type Message = {
  text: string;
  isUser: boolean;
};

export default function GeneratePage() {
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const userMessage: Message = { text: inputMessage, isUser: true };
      const aiMessage: Message = { text: "I'm here to help! What would you like to know?", isUser: false };
      setChatMessages([...chatMessages, userMessage, aiMessage]);
      setInputMessage("");
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Full-width chat container */}
      <div className="flex-grow bg-card text-card-foreground p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-4">AI Assistant</h2>
        <div
          ref={chatContainerRef}
          className="flex-grow overflow-y-auto mb-4 space-y-4 border border-gray-600/30 dark:border-gray-400/30 rounded-lg p-4"
        >
          {chatMessages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
            >
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
            placeholder="Ask anything..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="border-gray-600/30 dark:border-gray-400/30 flex-grow"
          />
          <Button onClick={handleSendMessage}>Send</Button>
        </div>
      </div>
    </div>
  );
}
