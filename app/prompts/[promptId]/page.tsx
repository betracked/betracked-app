"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CircleCheck,
  CircleDashed,
  CircleX,
  Loader,
  Loader2,
  Play,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProject } from "@/lib/project-context";
import { api } from "@/lib/api-client";
import type { PromptDetailResponseDto, VisibilityResponseDto } from "@/lib/Api";

// ---------- Constants ----------
const POLLING_INTERVAL_MS = 5000;

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

// ---------- Visibility History Table ----------
function VisibilityHistoryTable({
  history,
}: {
  history: VisibilityResponseDto[];
}) {
  if (history.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">
        No visibility checks have been run yet.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs font-normal text-muted-foreground">
              Date
            </TableHead>
            <TableHead className="text-xs font-normal text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="text-xs font-normal text-muted-foreground">
              Score
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="text-foreground text-sm">
                {formatDate(entry.createdAt)}
              </TableCell>
              <TableCell>
                <StatusBadge status={entry.status} />
              </TableCell>
              <TableCell>
                {entry.score !== null && entry.score !== undefined ? (
                  <span className="text-foreground text-sm font-medium tabular-nums">
                    {entry.score}
                  </span>
                ) : (
                  <span className="text-muted-foreground text-sm italic">
                    --
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-48 w-full" />
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

                {/* Prompt header */}
                <Card>
                  <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div className="flex flex-1 flex-col gap-2">
                      <CardTitle className="text-foreground text-base font-semibold text-balance leading-relaxed">
                        {prompt.text}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-2">
                        {prompt.topic ? (
                          <Badge
                            variant="outline"
                            className="text-muted-foreground px-1.5"
                          >
                            {String(prompt.topic)}
                          </Badge>
                        ) : null}
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
                              className="tabular-nums"
                            >
                              Score: {prompt.latestVisibility.score}
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
                  <CardContent>
                    <dl className="text-sm">
                      <div className="flex gap-2">
                        <dt className="text-muted-foreground">Created:</dt>
                        <dd className="text-foreground">
                          {formatDate(prompt.createdAt)}
                        </dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>

                {/* Visibility History */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-semibold">Visibility History</h3>
                  <VisibilityHistoryTable
                    history={prompt.visibilityHistory ?? []}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
