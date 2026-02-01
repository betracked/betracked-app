"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, Clock } from "lucide-react";
import { useProject } from "@/lib/project-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function PromptsList() {
  const { project } = useProject();
  const [progress, setProgress] = useState(0);

  // Calculate overall progress
  useEffect(() => {
    if (!project?.prompts.length) {
      setProgress(0);
      return;
    }

    const doneCount = project.prompts.filter((p) => p.status === "done").length;
    const analyzingCount = project.prompts.filter(
      (p) => p.status === "analyzing"
    ).length;

    // Done = 100%, Analyzing = 50%, Pending = 0%
    const totalProgress =
      (doneCount * 100 + analyzingCount * 50) / project.prompts.length;
    setProgress(totalProgress);
  }, [project?.prompts]);

  if (!project) {
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
    },
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Progress</CardTitle>
          <CardDescription>
            Analyzing {project.websiteUrl}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {project.prompts.filter((p) => p.status === "done").length} of{" "}
              {project.prompts.length} complete
            </span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </CardContent>
      </Card>

      {/* Prompts List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold px-4 lg:px-6">
          Analysis Prompts
        </h2>
        <div className="grid gap-4 px-4 lg:px-6">
          {project.prompts.map((prompt) => {
            const config = statusConfig[prompt.status];
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
                {prompt.status === "done" && prompt.score !== undefined && (
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Score
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={prompt.score}
                          className="w-24 h-1.5"
                        />
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
