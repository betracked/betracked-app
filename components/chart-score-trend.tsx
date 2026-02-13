"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// Dummy data: score trends across prompts for 3 AI models + overall visibility
const scoreTrendData = [
  { date: "2025-11-01", gpt4: 72, claude: 68, gemini: 61, overall: 67 },
  { date: "2025-11-08", gpt4: 74, claude: 70, gemini: 63, overall: 69 },
  { date: "2025-11-15", gpt4: 71, claude: 72, gemini: 60, overall: 68 },
  { date: "2025-11-22", gpt4: 76, claude: 73, gemini: 65, overall: 71 },
  { date: "2025-11-29", gpt4: 78, claude: 71, gemini: 67, overall: 72 },
  { date: "2025-12-06", gpt4: 80, claude: 75, gemini: 66, overall: 74 },
  { date: "2025-12-13", gpt4: 77, claude: 76, gemini: 69, overall: 74 },
  { date: "2025-12-20", gpt4: 82, claude: 78, gemini: 70, overall: 77 },
  { date: "2025-12-27", gpt4: 79, claude: 80, gemini: 72, overall: 77 },
  { date: "2026-01-03", gpt4: 84, claude: 79, gemini: 74, overall: 79 },
  { date: "2026-01-10", gpt4: 83, claude: 82, gemini: 71, overall: 79 },
  { date: "2026-01-17", gpt4: 86, claude: 81, gemini: 75, overall: 81 },
  { date: "2026-01-24", gpt4: 85, claude: 83, gemini: 77, overall: 82 },
  { date: "2026-01-31", gpt4: 88, claude: 85, gemini: 76, overall: 83 },
  { date: "2026-02-07", gpt4: 87, claude: 84, gemini: 79, overall: 83 },
  { date: "2026-02-13", gpt4: 90, claude: 86, gemini: 80, overall: 85 },
];

const chartConfig = {
  gpt4: {
    label: "GPT-4o",
    color: "var(--chart-1)",
  },
  claude: {
    label: "Claude 3.5",
    color: "var(--chart-3)",
  },
  gemini: {
    label: "Gemini Pro",
    color: "var(--chart-5)",
  },
  overall: {
    label: "Overall",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function ChartScoreTrend() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("30d");
    }
  }, [isMobile]);

  const filteredData = React.useMemo(() => {
    const referenceDate = new Date("2026-02-13");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return scoreTrendData.filter((item) => new Date(item.date) >= startDate);
  }, [timeRange]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>AI Visibility Score Trend</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Score comparison across AI models over time
          </span>
          <span className="@[540px]/card:hidden">Model score trends</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <LineChart data={filteredData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[50, 100]}
              tickFormatter={(value) => `${value}`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                  indicator="line"
                />
              }
            />
            <Line
              dataKey="overall"
              type="monotone"
              stroke="var(--color-overall)"
              strokeWidth={3}
              dot={false}
              strokeDasharray="6 3"
            />
            <Line
              dataKey="gpt4"
              type="monotone"
              stroke="var(--color-gpt4)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="claude"
              type="monotone"
              stroke="var(--color-claude)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="gemini"
              type="monotone"
              stroke="var(--color-gemini)"
              strokeWidth={2}
              dot={false}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
