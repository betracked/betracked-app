"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, Clock } from "lucide-react";
import { useProject } from "@/lib/project-context";
import type { ProjectResponseDto } from "@/lib/Api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type PromptWithStatus = ProjectResponseDto["prompts"][number] & {
  status?: "pending" | "analyzing" | "done";
  score?: number;
};

const EMPTY_PROMPTS: PromptWithStatus[] = [];

export function PromptsList() {
  const { activeProject } = useProject();
  const [progress, setProgress] = useState(0);
  // API prompts do not include analysis status yet, so default to "pending".
  const prompts = (activeProject?.prompts ??
    EMPTY_PROMPTS) as PromptWithStatus[];

  // Calculate overall progress
  useEffect(() => {
    if (!prompts.length) {
      setTimeout(() => {
        setProgress(0);
      }, 0);
      return;
    }

    const doneCount = prompts.filter(
      (p) => (p.status ?? "pending") === "done"
    ).length;
    const analyzingCount = prompts.filter(
      (p) => (p.status ?? "pending") === "analyzing"
    ).length;

    // Done = 100%, Analyzing = 50%, Pending = 0%
    const totalProgress =
      (doneCount * 100 + analyzingCount * 50) / prompts.length;
    setProgress(totalProgress);
  }, [prompts]);

  if (!activeProject) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Project</CardTitle>
          <CardDescription>
            Complete onboarding to start analyzing your website
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const statusConfig = {
    pending: {
      icon: Clock,
      label: "Pending",
      variant: "outline" as const,
      color: "text-muted-foreground",
      animate: false,
    },
    analyzing: {
      icon: Loader2,
      label: "Analyzing",
      variant: "default" as const,
      color: "text-primary",
      animate: true,
    },
    done: {
      icon: CheckCircle2,
      label: "Complete",
      variant: "secondary" as const,
      color: "text-green-600 dark:text-green-500",
      animate: false,
    },
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Progress</CardTitle>
          <CardDescription>
            Analyzing {activeProject.websiteUrl}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {prompts.filter((p) => (p.status ?? "pending") === "done").length}{" "}
              of {prompts.length} complete
            </span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </CardContent>
      </Card>

      {/* Prompts List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold px-4 lg:px-6">Analysis Prompts</h2>
        <div className="grid gap-4 px-4 lg:px-6">
          {prompts.map((prompt) => {
            const status = prompt.status ?? "pending";
            const config = statusConfig[status];
            const Icon = config.icon;

            return (
              <Card key={prompt.id} size="sm">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <CardDescription className="flex-1 text-base text-foreground">
                      {prompt.text}
                    </CardDescription>
                    <Badge variant={config.variant}>
                      <Icon
                        className={`h-3 w-3 ${config.color} ${
                          config.animate ? "animate-spin" : ""
                        }`}
                      />
                      {config.label}
                    </Badge>
                  </div>
                </CardHeader>
                {status === "done" && prompt.score !== undefined && (
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Score
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress value={prompt.score} className="w-24 h-1.5" />
                        <span className="text-sm font-semibold tabular-nums min-w-[3ch]">
                          {prompt.score}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
