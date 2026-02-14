"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import {
  Plus,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Globe,
  Sparkles,
  Languages,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import { useProject } from "@/lib/project-context";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OnboardingLoading } from "@/components/onboarding-loading";
import { OnboardingPromptCard } from "@/components/onboarding-prompt-card";
import type { AnalysisResponseDto } from "@/lib/Api";
import { LANGUAGES, DEFAULT_LANGUAGE } from "@/lib/languages";

// Validation schema
const urlSchema = z.object({
  websiteUrl: z.string().url("Please enter a valid URL"),
  language: z.string().min(2, "Please select a language"),
});

type OnboardingFormData = z.infer<typeof urlSchema>;
type Step = "url" | "loading" | "prompts";

export function OnboardingForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { loadProjects } = useProject();

  const [step, setStep] = useState<Step>("url");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [prompts, setPrompts] = useState<
    {
      text: string;
      topic: string | null;
      selected: boolean;
      isCustom: boolean;
    }[]
  >([]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<OnboardingFormData>>({});

  // Analysis state
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResponseDto | null>(
    null
  );
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Poll analysis status
  useEffect(() => {
    if (!analysisId || step !== "loading") {
      return;
    }

    const pollAnalysis = async () => {
      try {
        const response = await api.api.analysisControllerGetAnalysis(
          analysisId
        );
        const data = response.data;
        setAnalysisData(data);

        // Handle completion
        if (data.status === "completed" && data.prompts) {
          // Stop polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }

          // Initialize prompts from backend with first 5 pre-selected
          setPrompts(
            data.prompts.map((p) => ({
              text: p.text,
              topic: p.topic,
              selected: true,
              isCustom: false,
            }))
          );
          setStep("prompts");
        } else if (data.status === "failed") {
          // Stop polling on failure
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          setAnalysisError("Analysis failed. Please try again.");
        }
      } catch (error) {
        console.error("Failed to fetch analysis:", error);
        setAnalysisError("Failed to fetch analysis status.");
      }
    };

    // Initial fetch
    pollAnalysis();

    // Start polling every 1 second
    pollingIntervalRef.current = setInterval(pollAnalysis, 1000);

    // Cleanup on unmount or step change
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [analysisId, step]);

  // Handle URL submission
  const handleUrlSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setAnalysisError(null);

    const data = { websiteUrl, language };
    const result = urlSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Partial<OnboardingFormData> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof OnboardingFormData;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Create project via onboarding API
      const response = await api.api.onboardingControllerCreateAnalysis({
        websiteUrl,
        language,
      });

      setAnalysisId(response.data.id);

      // Refresh user so needsOnboarding updates (backend sets it false after project creation)
      await refreshUser();

      // Move to loading step (polling will start automatically)
      setStep("loading");
    } catch (error) {
      const apiError = error as { error?: { message?: string } };
      const message =
        apiError?.error?.message ||
        "Failed to create project. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle retry on failure
  const handleRetry = useCallback(() => {
    setAnalysisError(null);
    setAnalysisData(null);
    setStep("url");
  }, []);

  // Toggle prompt selection
  const togglePrompt = (index: number) => {
    setPrompts((prev) =>
      prev.map((p, i) => (i === index ? { ...p, selected: !p.selected } : p))
    );
  };

  // Edit prompt text
  const editPrompt = (index: number, newText: string) => {
    setPrompts((prev) =>
      prev.map((p, i) => (i === index ? { ...p, text: newText } : p))
    );
  };

  // Remove prompt
  const removePrompt = (index: number) => {
    setPrompts((prev) => prev.filter((_, i) => i !== index));
  };

  // Add custom prompt
  const addCustomPrompt = () => {
    if (!customPrompt.trim()) return;
    if (prompts.some((p) => p.text === customPrompt.trim())) {
      toast.error("This prompt already exists");
      return;
    }
    setPrompts((prev) => [
      ...prev,
      {
        text: customPrompt.trim(),
        topic: null,
        selected: true,
        isCustom: true,
      },
    ]);
    setCustomPrompt("");
  };

  // Selected count
  const selectedCount = prompts.filter((p) => p.selected).length;

  // Handle final confirmation
  const handleConfirm = async () => {
    const selectedPrompts = prompts
      .filter((p) => p.selected)
      .map((p) => ({ text: p.text, topic: p.topic }));
    if (selectedPrompts.length === 0) {
      toast.error("Please select at least one prompt");
      return;
    }

    await api.api.onboardingControllerCreateProject({
      websiteUrl,
      language,
      prompts: selectedPrompts.map((p) => ({
        text: p.text,
        topic: p.topic,
      })),
    });

    // Refetch user (needsOnboarding false) and projects so / has fresh data
    await refreshUser();
    await loadProjects();
    toast.success("Analysis complete! Redirecting...");
    router.push("/");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {["url", "loading", "prompts"].map((s, i) => {
          const stepIndex = ["url", "loading", "prompts"].indexOf(step);
          const isActive = i <= stepIndex;
          return (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  "size-2 rounded-full transition-all duration-500",
                  isActive ? "bg-primary scale-100" : "bg-border scale-75"
                )}
              />
              {i < 2 && (
                <div
                  className={cn(
                    "h-px w-8 transition-all duration-500",
                    isActive && i < stepIndex ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* URL Step */}
      {step === "url" && (
        <form
          onSubmit={handleUrlSubmit}
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <FieldGroup>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 mb-2">
                <Globe className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground text-balance">
                Welcome to betracked
              </h1>
              <p className="text-muted-foreground text-sm text-balance max-w-sm">
                Enter your website URL and we&apos;ll generate tailored analysis
                prompts to help you improve.
              </p>
            </div>

            <Field data-invalid={!!errors.websiteUrl}>
              <FieldLabel htmlFor="websiteUrl">Website URL</FieldLabel>
              <Input
                id="websiteUrl"
                name="websiteUrl"
                type="url"
                placeholder="https://example.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                autoComplete="url"
                disabled={isLoading}
                required
              />
              {errors.websiteUrl && (
                <FieldError>{errors.websiteUrl}</FieldError>
              )}
              <FieldDescription>
                We&apos;ll scan your site to generate relevant analysis prompts
              </FieldDescription>
            </Field>

            <Field data-invalid={!!errors.language}>
              <FieldLabel htmlFor="language">
                <div className="flex items-center gap-2">
                  <Languages className="size-4" />
                  <span>Language</span>
                </div>
              </FieldLabel>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger
                  id="language"
                  className="w-full"
                  aria-invalid={!!errors.language}
                  disabled={isLoading}
                >
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="flex items-center gap-2">
                        <span>{lang.name}</span>
                        {lang.nativeName && (
                          <span className="text-muted-foreground text-xs">
                            ({lang.nativeName})
                          </span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.language && <FieldError>{errors.language}</FieldError>}
              <FieldDescription>
                Your language preference helps us generate more relevant and
                accurate prompt suggestions tailored to your content
              </FieldDescription>
            </Field>

            <Field>
              <Button
                type="submit"
                className="w-full gap-2"
                disabled={isLoading}
              >
                Analyze Website
                <ArrowRight className="size-4" />
              </Button>
            </Field>
          </FieldGroup>
        </form>
      )}

      {/* Loading Transition Step */}
      {step === "loading" && (
        <div className="animate-in fade-in duration-500">
          <OnboardingLoading
            websiteUrl={websiteUrl}
            status={analysisData?.status || "pending"}
            progress={analysisData?.progress || 0}
            error={analysisError}
            onRetry={handleRetry}
          />
        </div>
      )}

      {/* Prompts Step */}
      {step === "prompts" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-5">
          {/* Header */}
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 mb-2">
              <Sparkles className="size-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground text-balance">
              Your analysis prompts
            </h1>
            <p className="text-muted-foreground text-sm text-balance max-w-sm">
              Select the prompts you want to include, edit them, or add your own
              custom prompts.
            </p>
          </div>

          {/* Selection summary */}
          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2.5">
            <span className="text-sm text-muted-foreground">
              {selectedCount} of {prompts.length} selected
            </span>
            <button
              type="button"
              onClick={() =>
                setPrompts((prev) =>
                  prev.map((p) => ({
                    ...p,
                    selected: selectedCount < prompts.length,
                  }))
                )
              }
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {selectedCount === prompts.length ? "Deselect all" : "Select all"}
            </button>
          </div>

          {/* Prompt cards */}
          <div className="flex flex-col gap-3 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
            {prompts.map((prompt, index) => (
              <OnboardingPromptCard
                key={`${prompt.text}-${index}`}
                prompt={prompt.text}
                isSelected={prompt.selected}
                isCustom={prompt.isCustom}
                onToggle={() => togglePrompt(index)}
                onEdit={(newText) => editPrompt(index, newText)}
                onRemove={() => removePrompt(index)}
                index={index}
              />
            ))}
          </div>

          {/* Add custom prompt */}
          <div className="flex flex-col gap-2">
            <FieldLabel className="text-sm font-medium">
              Add a custom prompt
            </FieldLabel>
            <div className="flex gap-2">
              <Input
                placeholder="Enter your own analysis prompt..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomPrompt();
                  }
                }}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={addCustomPrompt}
                disabled={!customPrompt.trim() || isLoading}
                className="shrink-0"
              >
                <Plus className="size-4" />
                <span className="sr-only">Add prompt</span>
              </Button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("url")}
              disabled={isLoading}
              className="flex-1 gap-2"
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading || selectedCount === 0}
              className="flex-1 gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
