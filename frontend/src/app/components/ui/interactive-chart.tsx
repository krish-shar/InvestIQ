"use client";
import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Legend } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/components/ui/chart";

const chartData = [
  { month: "January", Apple: 150, Microsoft: 220, Google: 180 },
  { month: "February", Apple: 180, Microsoft: 230, Google: 190 },
  { month: "March", Apple: 170, Microsoft: 250, Google: 200 },
  { month: "April", Apple: 160, Microsoft: 240, Google: 210 },
  { month: "May", Apple: 190, Microsoft: 260, Google: 220 },
  { month: "June", Apple: 200, Microsoft: 270, Google: 230 },
];

const chartConfig = {
  Apple: {
    label: "Apple",
    color: "hsl(210, 70%, 60%)",
  },
  Microsoft: {
    label: "Microsoft",
    color: "hsl(140, 70%, 60%)",
  },
  Google: {
    label: "Google",
    color: "hsl(50, 70%, 60%)",
  },
} satisfies ChartConfig;

export default function InteractiveChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Performance - 2024</CardTitle>
        <CardDescription>January - June</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 10,
              bottom: 10,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} />
            <Legend />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="Apple"
              type="linear"
              stroke="hsl(210, 70%, 60%)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="Microsoft"
              type="linear"
              stroke="hsl(140, 70%, 60%)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="Google"
              type="linear"
              stroke="hsl(50, 70%, 60%)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Stocks trending up this quarter <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing stock performance for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}
