"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

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

// Dummy data: daily page visits segmented by human vs robot user agents
const pageVisitsData = [
  { date: "2026-01-15", humans: 342, robots: 128 },
  { date: "2026-01-16", humans: 389, robots: 145 },
  { date: "2026-01-17", humans: 410, robots: 312 },
  { date: "2026-01-18", humans: 278, robots: 98 },
  { date: "2026-01-19", humans: 195, robots: 86 },
  { date: "2026-01-20", humans: 425, robots: 167 },
  { date: "2026-01-21", humans: 467, robots: 201 },
  { date: "2026-01-22", humans: 398, robots: 178 },
  { date: "2026-01-23", humans: 445, robots: 256 },
  { date: "2026-01-24", humans: 512, robots: 189 },
  { date: "2026-01-25", humans: 320, robots: 110 },
  { date: "2026-01-26", humans: 210, robots: 95 },
  { date: "2026-01-27", humans: 478, robots: 223 },
  { date: "2026-01-28", humans: 502, robots: 198 },
  { date: "2026-01-29", humans: 489, robots: 345 },
  { date: "2026-01-30", humans: 534, robots: 210 },
  { date: "2026-01-31", humans: 498, robots: 176 },
  { date: "2026-02-01", humans: 312, robots: 142 },
  { date: "2026-02-02", humans: 225, robots: 108 },
  { date: "2026-02-03", humans: 556, robots: 234 },
  { date: "2026-02-04", humans: 523, robots: 287 },
  { date: "2026-02-05", humans: 578, robots: 198 },
  { date: "2026-02-06", humans: 545, robots: 312 },
  { date: "2026-02-07", humans: 601, robots: 245 },
  { date: "2026-02-08", humans: 356, robots: 132 },
  { date: "2026-02-09", humans: 267, robots: 115 },
  { date: "2026-02-10", humans: 612, robots: 278 },
  { date: "2026-02-11", humans: 589, robots: 301 },
  { date: "2026-02-12", humans: 634, robots: 256 },
  { date: "2026-02-13", humans: 598, robots: 223 },
];

const chartConfig = {
  humans: {
    label: "Human Visitors",
    color: "var(--chart-1)",
  },
  robots: {
    label: "Robots / Crawlers",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function ChartPageVisits() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("30d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const filteredData = React.useMemo(() => {
    const referenceDate = new Date("2026-02-13");
    let daysToSubtract = 30;
    if (timeRange === "7d") {
      daysToSubtract = 7;
    } else if (timeRange === "14d") {
      daysToSubtract = 14;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return pageVisitsData.filter((item) => new Date(item.date) >= startDate);
  }, [timeRange]);

  // Compute summary stats
  const totalHumans = filteredData.reduce((sum, d) => sum + d.humans, 0);
  const totalRobots = filteredData.reduce((sum, d) => sum + d.robots, 0);
  const total = totalHumans + totalRobots;
  const humanPct = total > 0 ? Math.round((totalHumans / total) * 100) : 0;

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex flex-col gap-1">
          <CardTitle>Page Visits by User Agent</CardTitle>
          <CardDescription>
            <span className="hidden @[540px]/card:block">
              {totalHumans.toLocaleString()} humans ({humanPct}%) &middot;{" "}
              {totalRobots.toLocaleString()} robots &middot;{" "}
              {total.toLocaleString()} total
            </span>
            <span className="@[540px]/card:hidden">
              {humanPct}% human traffic
            </span>
          </CardDescription>
        </div>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="14d">Last 14 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select time range"
            >
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="14d" className="rounded-lg">
                Last 14 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
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
          <BarChart data={filteredData} accessibilityLayer>
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
              tickFormatter={(value) => `${value}`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Bar
              dataKey="humans"
              fill="var(--color-humans)"
              radius={[4, 4, 0, 0]}
              stackId="visits"
            />
            <Bar
              dataKey="robots"
              fill="var(--color-robots)"
              radius={[4, 4, 0, 0]}
              stackId="visits"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
