import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";

interface StockCardProps {
  symbol: string;
  data: {
    symbol: string;
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
  };
}

export default function StockCard({ symbol, data }: StockCardProps) {
  if (!data || !data.date) {
    return (
      <Card className="w-[300px]">
        <CardHeader>
          <CardTitle>{symbol}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No data available for {symbol}.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-[300px]">
      <CardHeader>
        <CardTitle>{symbol}</CardTitle>
        <CardDescription>
          Data for {new Date(data.date).toLocaleDateString("en-US")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p><strong>Open:</strong> ${data.open.toFixed(2)}</p>
        <p><strong>High:</strong> ${data.high.toFixed(2)}</p>
        <p><strong>Low:</strong> ${data.low.toFixed(2)}</p>
        <p><strong>Close:</strong> ${data.close.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        {}
      </CardFooter>
    </Card>
  );
}


