"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { useTheme } from "next-themes";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { motion, AnimatePresence } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

type Message = {
  text: string;
  isUser: boolean;
  isImage?: boolean;
  imageData?: string;
  markdown?: string;
};

export default function AlgoTraderPage() {
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { text: "Please specify the trading strategy that you want to model an algorithm for", isUser: false }
  ]);
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
      
      const aiMessage: Message = {
        text: data.response,
        isUser: false,
        markdown: data.markdown
      };
      setChatMessages((prev) => [...prev, aiMessage]);

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
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                className="rounded-md"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-1 rounded" {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {message.markdown || message.text}
      </ReactMarkdown>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="w-full max-w-3xl mx-auto p-6 flex flex-col">
        <h2 className="text-3xl font-bold mb-6 text-center">Algorithm Writer</h2>
        <div ref={chatContainerRef} className="flex-grow overflow-y-auto mb-6 p-4 border border-gray-300 dark:border-gray-700 rounded-lg space-y-4 bg-white dark:bg-gray-800 shadow-md">
          <AnimatePresence>
            {chatMessages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isUser
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 prose dark:prose-invert'
                  }`}
                >
                  <MessageContent message={message} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Describe your trading strategy..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={isLoading}
            className="flex-grow bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isLoading ? "Generating..." : "Generate"}
          </Button>
        </div>
      </div>
      <style jsx global>{`
        .prose a {
          color: #3b82f6;
          text-decoration: none;
        }
        .prose a:hover {
          text-decoration: underline;
        }
        .dark .prose a {
          color: #60a5fa;
        }
        .hljs {
          display: block;
          overflow-x: auto;
          padding: 0.5em;
          color: #383a42;
          background: #fafafa;
        }
        .dark .hljs {
          color: #abb2bf;
          background: #282c34;
        }
      `}</style>
    </div>
  );
}