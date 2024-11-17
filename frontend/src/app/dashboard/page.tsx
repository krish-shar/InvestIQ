"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const [stocks, setStocks] = useState<string[]>([]);

  useEffect(() => {
    // In a real application, you would fetch the selected stocks from an API or local storage
    // For this example, we'll use dummy data
    setStocks(['AAPL', 'GOOGL', 'MSFT']);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background text-foreground p-8"
    >
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stocks.map((stock) => (
          <motion.div
            key={stock}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card text-card-foreground p-6 rounded-lg shadow-md"
          >
            <h2 className="text-2xl font-semibold mb-4">{stock}</h2>
            <p>Stock information and charts will go here.</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}