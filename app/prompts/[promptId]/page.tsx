"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceDot,
} from "recharts";
import {
  ArrowLeft,
  CircleCheck,
  CircleDashed,
  CircleX,
  Loader,
  Loader2,
  Play,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { toast } from "sonner";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { useProject } from "@/lib/project-context";
import { api } from "@/lib/api-client";
import type {
  PromptDetailResponseDto,
  VisibilityResponseDto,
} from "@/lib/Api";
import { cn } from "@/lib/utils";

// ---------- Constants ----------
const POLLING_INTERVAL_MS = 5000;

// ---------- Chart config ----------
const chartConfig = {
  score: {
    label: "Score",
    color: "var(--color-chart-2)",
  },
} satisfies ChartConfig;

// ---------- Status helpers ----------
type VisibilityStatus = "analyzing" | "completed" | "failed";

const statusDisplay: Record<
  VisibilityStatus,
  { icon: React.ElementType; label: string; className: string }
> = {
  completed: {
    icon: CircleCheck,
    label: "Completed",
    className: "fill-green-500 dark:fill-green-400 text-background",
  },
  analyzing: {
    icon: Loader,
    label: "Analyzing",
    className: "text-primary animate-spin",
  },
  failed: {
    icon: CircleX,
    label: "Failed",
    className: "fill-destructive text-background",
  },
};

function StatusBadge({ status }: { status: VisibilityStatus }) {
  const config = statusDisplay[status];
  const Icon = config.icon;
  return (
    <Badge variant="outline" className="text-muted-foreground gap-1 px-1.5">
      <Icon className={`size-3.5 ${config.className}`} />
      {config.label}
    </Badge>
  );
}

function PendingBadge() {
  return (
    <Badge variant="outline" className="text-muted-foreground gap-1 px-1.5">
      <CircleDashed className="size-3.5 text-muted-foreground" />
      Pending
    </Badge>
  );
}

// ---------- Format helpers ----------
function formatDate(dateStr: string | object | null) {
  if (!dateStr || typeof dateStr !== "string") return "--";
  try {
    return new Date(dateStr).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "--";
  }
}

function formatShortDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "--";
  }
}

function formatChartTooltipDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

// ---------- Trend helper ----------
function computeTrend(history: VisibilityResponseDto[]) {
  const completed = history.filter(
    (h) => h.status === "completed" && h.score !== null
  );
  if (completed.length < 2) return null;
  const latest = completed[0].score!;
  const previous = completed[1].score!;
  const diff = latest - previous;
  if (diff > 0) return { direction: "up" as const, diff };
  if (diff < 0) return { direction: "down" as const, diff };
  return { direction: "flat" as const, diff: 0 };
}

// ---------- Score Progression Chart ----------
function ScoreChart({
  history,
  hoveredId,
  onHover,
}: {
  history: VisibilityResponseDto[];
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}) {
  const chartData = useMemo(() => {
    // Reverse so oldest is first (left to right chronological)
    return [...history]
      .filter((h) => h.status === "completed" && h.score !== null)
      .reverse()
      .map((entry) => ({
        id: entry.id,
        date: entry.createdAt,
        score: entry.score ?? 0,
        dateLabel: formatShortDate(entry.createdAt),
      }));
  }, [history]);

  if (chartData.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-border">
        <p className="text-muted-foreground text-sm">
          No completed checks yet. Run a visibility check to see score
          progression.
        </p>
      </div>
    );
  }

  // Find the hovered point
  const hoveredPoint = hoveredId
    ? chartData.find((d) => d.id === hoveredId)
    : null;

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full">
      <AreaChart
        data={chartData}
        margin={{ top: 12, right: 12, bottom: 0, left: 0 }}
        onMouseMove={(state) => {
          if (state?.activePayload?.[0]?.payload) {
            onHover(state.activePayload[0].payload.id);
          }
        }}
        onMouseLeave={() => onHover(null)}
      >
        <defs>
          <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-chart-2)"
              stopOpacity={0.3}
            />
            <stop
              offset="100%"
              stopColor="var(--color-chart-2)"
              stopOpacity={0.02}
            />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="dateLabel"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={12}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={12}
          domain={[0, "auto"]}
        />
        <ChartTooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const data = payload[0].payload;
            return (
              <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
                <p className="text-muted-foreground">
                  {formatChartTooltipDate(data.date)}
                </p>
                <p className="mt-1 font-semibold text-foreground tabular-nums">
                  Score: {data.score}
                </p>
              </div>
            );
          }}
        />
        <Area
          type="monotone"
          dataKey="score"
          stroke="var(--color-chart-2)"
          strokeWidth={2}
          fill="url(#scoreGradient)"
          dot={(props) => {
            const { cx, cy, payload } = props;
            const isHovered = payload.id === hoveredId;
            return (
              <circle
                key={payload.id}
                cx={cx}
                cy={cy}
                r={isHovered ? 6 : 4}
                fill={
                  isHovered
                    ? "var(--color-chart-2)"
                    : "var(--color-background)"
                }
                stroke="var(--color-chart-2)"
                strokeWidth={2}
                className="transition-all duration-150"
              />
            );
          }}
          activeDot={false}
        />
        {hoveredPoint && (
          <ReferenceDot
            x={hoveredPoint.dateLabel}
            y={hoveredPoint.score}
            r={0}
            stroke="var(--color-chart-2)"
            strokeWidth={1}
            strokeDasharray="3 3"
            ifOverflow="extendDomain"
          />
        )}
      </AreaChart>
    </ChartContainer>
  );
}

// ---------- Expandable History Row ----------
function HistoryRow({
  entry,
  isLatest,
  isHighlighted,
  onHover,
}: {
  entry: VisibilityResponseDto;
  isLatest: boolean;
  isHighlighted: boolean;
  onHover: (id: string | null) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(isLatest);

  const hasLlmResponse =
    entry.llmResponse && entry.llmResponse.trim().length > 0;

  return (
    <div
      className={cn(
        "rounded-lg border transition-all duration-200",
        isHighlighted
          ? "border-chart-2/50 bg-chart-2/5 ring-1 ring-chart-2/20"
          : "border-border bg-card",
        isLatest && !isHighlighted && "border-border"
      )}
      onMouseEnter={() => onHover(entry.id)}
      onMouseLeave={() => onHover(null)}
    >
      <button
        type="button"
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={!hasLlmResponse && !isLatest}
      >
        {/* Date */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">
              {formatDate(entry.createdAt)}
            </span>
            {isLatest && (
              <span className="text-xs text-muted-foreground">Latest</span>
            )}
          </div>
        </div>

        {/* Status */}
        <StatusBadge status={entry.status} />

        {/* Score */}
        <div className="flex w-16 justify-end">
          {entry.score !== null && entry.score !== undefined ? (
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {entry.score}
            </span>
          ) : (
            <span className="text-sm italic text-muted-foreground">--</span>
          )}
        </div>

        {/* Expand chevron */}
        {hasLlmResponse && (
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
              isExpanded && "rotate-180"
            )}
          />
        )}
      </button>

      {/* Expanded LLM Response */}
      {isExpanded && hasLlmResponse && (
        <div className="border-t border-border px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            LLM Response
          </p>
          <div className="mt-3 max-h-96 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full">
            <MarkdownRenderer
              content={entry.llmResponse ?? ""}
              className="text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Loading skeleton ----------
function DetailSkeleton() {
  return (
    <div className="flex w-full flex-col gap-6 px-4 py-4 md:py-6 lg:px-6">
      <Skeleton className="h-8 w-40" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
      <Skeleton className="h-[240px] w-full rounded-lg" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
    </div>
  );
}

// ---------- Page Component ----------
export default function PromptDetailPage() {
  const router = useRouter();
  const params = useParams<{ promptId: string }>();
  const promptId = params.promptId;
  const { activeProject, isLoading: projectLoading } = useProject();

  const [prompt, setPrompt] = useState<PromptDetailResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTriggering, setIsTriggering] = useState(false);
  const [hoveredHistoryId, setHoveredHistoryId] = useState<string | null>(null);

  // ---- Fetch prompt detail ----
  const fetchPromptDetail = useCallback(async () => {
    if (!activeProject || !promptId) return;
    try {
      const response = await api.api.promptsControllerGetPromptDetail(
        activeProject.id,
        promptId
      );
      setPrompt(response.data);
    } catch {
      toast.error("Failed to load prompt details");
    } finally {
      setIsLoading(false);
    }
  }, [activeProject, promptId]);

  // Initial fetch
  useEffect(() => {
    if (projectLoading) return;
    if (!activeProject) return;
    fetchPromptDetail();
  }, [projectLoading, activeProject, fetchPromptDetail]);

  // ---- Polling when analyzing ----
  useEffect(() => {
    if (!prompt) return;
    const isAnalyzing = prompt.latestVisibility?.status === "analyzing";
    if (!isAnalyzing) return;

    const interval = setInterval(() => {
      fetchPromptDetail();
    }, POLLING_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [prompt, fetchPromptDetail]);

  // ---- Trigger visibility ----
  const handleTriggerVisibility = async () => {
    if (!activeProject || !promptId) return;
    setIsTriggering(true);
    try {
      await api.api.promptsControllerTriggerVisibility(
        activeProject.id,
        promptId
      );
      toast.success("Visibility check triggered");
      await fetchPromptDetail();
    } catch {
      toast.error("Failed to trigger visibility check");
    } finally {
      setIsTriggering(false);
    }
  };

  // Compute trend
  const trend = prompt ? computeTrend(prompt.visibilityHistory ?? []) : null;

  // ---- Show global loading ----
  if (projectLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-muted-foreground size-8 animate-spin" />
      </div>
    );
  }

  if (!activeProject) return null;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {isLoading ? (
              <DetailSkeleton />
            ) : !prompt ? (
              <div className="flex w-full flex-col items-center gap-4 py-16">
                <p className="text-muted-foreground text-sm">
                  Prompt not found.
                </p>
                <Button variant="outline" onClick={() => router.push("/")}>
                  <ArrowLeft className="size-4" />
                  Back to Dashboard
                </Button>
              </div>
            ) : (
              <div className="flex w-full flex-col gap-6 px-4 py-4 md:py-6 lg:px-6">
                {/* Back button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground w-fit gap-1"
                  onClick={() => router.push("/")}
                >
                  <ArrowLeft className="size-4" />
                  Back to Dashboard
                </Button>

                {/* Prompt header card */}
                <Card>
                  <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div className="flex flex-1 flex-col gap-3">
                      <CardTitle className="text-foreground text-base font-semibold leading-relaxed text-balance">
                        {prompt.text}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-2">
                        {prompt.latestVisibility ? (
                          <StatusBadge
                            status={prompt.latestVisibility.status}
                          />
                        ) : (
                          <PendingBadge />
                        )}
                        {prompt.latestVisibility?.score !== null &&
                          prompt.latestVisibility?.score !== undefined && (
                            <Badge
                              variant="secondary"
                              className="tabular-nums font-semibold"
                            >
                              Score: {prompt.latestVisibility.score}
                            </Badge>
                          )}
                        {trend && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "gap-1 tabular-nums",
                              trend.direction === "up" &&
                                "border-green-200 text-green-700 dark:border-green-800 dark:text-green-400",
                              trend.direction === "down" &&
                                "border-red-200 text-red-700 dark:border-red-800 dark:text-red-400",
                              trend.direction === "flat" &&
                                "text-muted-foreground"
                            )}
                          >
                            {trend.direction === "up" && (
                              <TrendingUp className="size-3" />
                            )}
                            {trend.direction === "down" && (
                              <TrendingDown className="size-3" />
                            )}
                            {trend.direction === "flat" && (
                              <Minus className="size-3" />
                            )}
                            {trend.diff > 0 ? "+" : ""}
                            {trend.diff}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTriggerVisibility}
                      disabled={isTriggering}
                    >
                      {isTriggering ? (
                        <Loader className="animate-spin" />
                      ) : (
                        <Play />
                      )}
                      <span className="hidden sm:inline">
                        Run Visibility Check
                      </span>
                    </Button>
                  </CardHeader>
                </Card>

                {/* Score Progression Chart */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">
                      Score Progression
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Visibility scores over time. Hover on points to highlight
                      the matching history entry below.
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ScoreChart
                      history={prompt.visibilityHistory ?? []}
                      hoveredId={hoveredHistoryId}
                      onHover={setHoveredHistoryId}
                    />
                  </CardContent>
                </Card>

                {/* Visibility History */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">
                      Visibility History
                    </h3>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {(prompt.visibilityHistory ?? []).length} check
                      {(prompt.visibilityHistory ?? []).length !== 1
                        ? "s"
                        : ""}
                    </span>
                  </div>

                  {(prompt.visibilityHistory ?? []).length === 0 ? (
                    <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border">
                      <p className="text-muted-foreground text-sm">
                        No visibility checks have been run yet.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {(prompt.visibilityHistory ?? []).map((entry, index) => (
                        <HistoryRow
                          key={entry.id}
                          entry={entry}
                          isLatest={index === 0}
                          isHighlighted={hoveredHistoryId === entry.id}
                          onHover={setHoveredHistoryId}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
