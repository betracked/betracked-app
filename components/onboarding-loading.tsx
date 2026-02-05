"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const ANALYSIS_STEPS = [
  "Connecting to website...",
  "Scanning page structure...",
  "Analyzing content...",
  "Generating prompts...",
];

interface OnboardingLoadingProps {
  websiteUrl: string;
  onComplete: () => void;
}

export function OnboardingLoading({
  websiteUrl,
  onComplete,
}: OnboardingLoadingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress smoothly
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 25);

    return () => clearInterval(progressInterval);
  }, []);

  useEffect(() => {
    // Step through the analysis steps
    const stepDuration = 650;
    const timers = ANALYSIS_STEPS.map((_, index) =>
      setTimeout(() => {
        setCurrentStep(index);
      }, index * stepDuration)
    );

    // Complete after all steps
    const completeTimer = setTimeout(() => {
      onComplete();
    }, ANALYSIS_STEPS.length * stepDuration + 200);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

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
      </div>

      {/* Animated step labels */}
      <div className="flex flex-col items-center gap-3 min-h-[120px]">
        {ANALYSIS_STEPS.map((step, index) => (
          <div
            key={step}
            className={cn(
              "flex items-center gap-2.5 text-sm transition-all duration-500",
              index < currentStep
                ? "text-primary opacity-100"
                : index === currentStep
                  ? "text-foreground opacity-100 translate-y-0"
                  : "text-muted-foreground/40 opacity-0 translate-y-2"
            )}
          >
            {index < currentStep ? (
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
            ) : index === currentStep ? (
              <div className="size-4 shrink-0 flex items-center justify-center">
                <div className="size-2 rounded-full bg-primary animate-pulse" />
              </div>
            ) : (
              <div className="size-4 shrink-0" />
            )}
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
