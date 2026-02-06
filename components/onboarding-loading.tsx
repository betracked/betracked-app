"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";

const ANALYSIS_STEPS = [
  "Connecting to website...",
  "Scanning page structure...",
  "Analyzing content...",
  "Generating prompts...",
];

interface OnboardingLoadingProps {
  websiteUrl: string;
  status: "pending" | "crawling" | "generating_prompts" | "completed" | "failed";
  progress: number;
  error?: string | null;
  onRetry?: () => void;
}

export function OnboardingLoading({
  websiteUrl,
  status,
  progress,
  error,
  onRetry,
}: OnboardingLoadingProps) {
  // Map backend status to step index
  const currentStep = useMemo(() => {
    switch (status) {
      case "pending":
        return 0;
      case "crawling":
        return 1;
      case "generating_prompts":
        return 2; // Will show both "Analyzing content..." and "Generating prompts..."
      case "completed":
        return 3;
      case "failed":
        return -1;
      default:
        return 0;
    }
  }, [status]);

  // Show error state if failed
  if (status === "failed" || error) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-8 text-destructive" />
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">Analysis Failed</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            {error || "We couldn't analyze your website. Please try again."}
          </p>
        </div>

        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="gap-2">
            <ArrowLeft className="size-4" />
            Try Again
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Animated scanning ring */}
      <div className="relative flex items-center justify-center">
        <div className="absolute size-28 animate-ping rounded-full bg-primary/10" />
        <div className="absolute size-24 animate-pulse rounded-full bg-primary/5" />
        <div className="relative flex size-20 items-center justify-center rounded-full bg-primary/10">
          <svg
            className="size-10 animate-spin text-primary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" className="opacity-20" />
            <path
              d="M12 2a10 10 0 0 1 10 10"
              className="opacity-80"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* URL being analyzed */}
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">Analyzing</p>
        <p className="mt-1 text-base font-semibold text-foreground truncate max-w-xs">
          {websiteUrl}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {progress}%
        </p>
      </div>

      {/* Animated step labels */}
      <div className="flex flex-col items-center gap-3 min-h-[120px]">
        {ANALYSIS_STEPS.map((step, index) => {
          // Determine if step is completed or current
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep || (status === "generating_prompts" && index >= 2 && index <= 3);

          return (
            <div
              key={step}
              className={cn(
                "flex items-center gap-2.5 text-sm transition-all duration-500",
                isCompleted
                  ? "text-primary opacity-100"
                  : isCurrent
                    ? "text-foreground opacity-100 translate-y-0"
                    : "text-muted-foreground/40 opacity-0 translate-y-2"
              )}
            >
              {isCompleted ? (
                <svg
                  className="size-4 text-primary shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    d="M20 6L9 17l-5-5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : isCurrent ? (
                <div className="size-4 shrink-0 flex items-center justify-center">
                  <div className="size-2 rounded-full bg-primary animate-pulse" />
                </div>
              ) : (
                <div className="size-4 shrink-0" />
              )}
              <span>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
