"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { useTheme } from "next-themes";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

type Message = {
  text: string;
  isUser: boolean;
  isImage?: boolean;
  imageData?: string;
};

export default function ChatbotPage() {
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = { text: inputMessage, isUser: true };
    setChatMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8080/algowriter", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ message: inputMessage }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Add the text response
      const aiMessage: Message = {
        text: data.response,
        isUser: false,
      };
      setChatMessages((prev) => [...prev, aiMessage]);

      // If there's an image, add it as a separate message
      if (data.image) {
        const imageMessage: Message = {
          text: "",
          isUser: false,
          isImage: true,
          imageData: data.image
        };
        setChatMessages((prev) => [...prev, imageMessage]);
      }

    } catch (error) {
      console.error("Error:", error);
      setChatMessages((prev) => [
        ...prev,
        { text: "Failed to get a response. Please try again.", isUser: false },
      ]);
    } finally {
      setIsLoading(false);
      setInputMessage("");
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const MessageContent = ({ message }: { message: Message }) => {
    if (message.isImage && message.imageData) {
      return (
        <div className="max-w-full">
          <img
            src={`data:image/png;base64,${message.imageData}`}
            alt="Generated visualization"
            className="rounded-lg max-w-full h-auto"
            style={{ maxWidth: '500px', height: 'auto' }}
            />
        </div>
      );
    }

    return (
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-bold" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-bold" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
          em: ({ node, ...props }) => <em className="italic" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc list-inside" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-inside" {...props} />,
          a: ({ node, ...props }) => <a className="text-blue-500 hover:underline" {...props} />,
          code({ node, inline, className, children, ...props }) {
            return inline ? (
              <code className="bg-gray-100 dark:bg-gray-800 p-1 rounded" {...props}>
                {children}
              </code>
            ) : (
              <div className="relative">
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                  <button
                    className="absolute top-2 right-2 text-sm text-blue-500"
                    onClick={() => navigator.clipboard.writeText(children.toString())}
                  >
                    Copy Code
                  </button>
                  <code className="block">{children}</code>
                </pre>
              </div>
            );
          },
        }}
      >
        {message.text}
      </ReactMarkdown>
    );
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className="w-full max-w-2xl mx-auto p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-4">Chat with AI</h2>
        <div ref={chatContainerRef} className="flex-grow overflow-y-auto mb-4 p-4 border rounded-lg space-y-4">
          {chatMessages.map((message, index) => (
            <div key={index} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  message.isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 prose dark:prose-invert'
                }`}
              >
                <MessageContent message={message} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={isLoading}
          />
          <Button onClick={handleSendMessage} disabled={isLoading}>
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>
      <style jsx global>{`
        .prose a {
          text-decoration: none;
        }
        .prose a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}