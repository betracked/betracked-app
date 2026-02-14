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
  Swords,
  X,
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
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { OnboardingLoading } from "@/components/onboarding-loading";
import { OnboardingPromptCard } from "@/components/onboarding-prompt-card";
import { LanguageCombobox } from "@/components/language-combobox";
import type { AnalysisResponseDto } from "@/lib/Api";
import { DEFAULT_LANGUAGE } from "@/lib/languages";

// Helper to build full URL from domain input
function buildUrl(domain: string): string {
  const trimmed = domain.trim();
  if (!trimmed) return "";
  // Strip any protocol the user may have pasted in
  const cleaned = trimmed.replace(/^https?:\/\//, "");
  return `https://${cleaned}`;
}

// Validation schema
const urlSchema = z.object({
  websiteUrl: z
    .string()
    .min(1, "Please enter your website domain")
    .refine(
      (val) => {
        try {
          const url = new URL(buildUrl(val));
          return !!url.hostname && url.hostname.includes(".");
        } catch {
          return false;
        }
      },
      { message: "Please enter a valid domain (e.g. example.com)" }
    ),
  language: z.string().min(2, "Please select a language"),
});

type OnboardingFormData = z.infer<typeof urlSchema>;
type Step = "url" | "loading" | "prompts" | "competitors";

const MAX_COMPETITORS = 5;

// Competitor validation
const competitorUrlSchema = z.object({
  name: z.string().min(1, "Name is required"),
  websiteUrl: z
    .string()
    .min(1, "Website URL is required")
    .refine(
      (val) => {
        try {
          const url = new URL(buildUrl(val));
          return !!url.hostname && url.hostname.includes(".");
        } catch {
          return false;
        }
      },
      { message: "Please enter a valid domain (e.g. competitor.com)" }
    ),
});

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
  const [competitors, setCompetitors] = useState<
    { name: string; websiteUrl: string }[]
  >([]);
  const [competitorName, setCompetitorName] = useState("");
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [competitorErrors, setCompetitorErrors] = useState<{
    name?: string;
    websiteUrl?: string;
  }>({});
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
    const fullUrl = buildUrl(websiteUrl);

    try {
      // Create project via onboarding API
      const response = await api.api.onboardingControllerCreateAnalysis({
        websiteUrl: fullUrl,
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

  // Add competitor
  const addCompetitor = () => {
    setCompetitorErrors({});

    const result = competitorUrlSchema.safeParse({
      name: competitorName,
      websiteUrl: competitorUrl,
    });

    if (!result.success) {
      const fieldErrors: { name?: string; websiteUrl?: string } = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as "name" | "websiteUrl";
        fieldErrors[field] = issue.message;
      });
      setCompetitorErrors(fieldErrors);
      return;
    }

    const fullUrl = buildUrl(competitorUrl);
    if (
      competitors.some(
        (c) => c.websiteUrl.toLowerCase() === fullUrl.toLowerCase()
      )
    ) {
      toast.error("This competitor is already added");
      return;
    }

    setCompetitors((prev) => [
      ...prev,
      { name: competitorName.trim(), websiteUrl: fullUrl },
    ]);
    setCompetitorName("");
    setCompetitorUrl("");
    setCompetitorErrors({});
  };

  // Remove competitor
  const removeCompetitor = (index: number) => {
    setCompetitors((prev) => prev.filter((_, i) => i !== index));
  };

  // Selected count
  const selectedCount = prompts.filter((p) => p.selected).length;

  // Handle moving from prompts to competitors step
  const handlePromptsNext = () => {
    const selectedPrompts = prompts.filter((p) => p.selected);
    if (selectedPrompts.length === 0) {
      toast.error("Please select at least one prompt");
      return;
    }
    setStep("competitors");
  };

  // Handle final confirmation
  const handleConfirm = async () => {
    const selectedPrompts = prompts
      .filter((p) => p.selected)
      .map((p) => ({ text: p.text, topic: p.topic }));
    if (selectedPrompts.length === 0) {
      toast.error("Please select at least one prompt");
      return;
    }

    setIsLoading(true);

    try {
      const projectName =
        analysisData?.name ??
        new URL(buildUrl(websiteUrl)).hostname ??
        "My Project";

      await api.api.onboardingControllerCreateProject({
        websiteUrl: buildUrl(websiteUrl),
        name: projectName,
        language,
        prompts: selectedPrompts.map((p) => ({
          text: p.text,
          topic: p.topic,
        })),
        competitors:
          competitors.length > 0
            ? competitors.map((c) => ({
                name: c.name,
                websiteUrl: c.websiteUrl,
              }))
            : undefined,
      });

      // Refetch user (needsOnboarding false) and projects so / has fresh data
      await refreshUser();
      await loadProjects();
      toast.success("Analysis complete! Redirecting...");
      router.push("/");
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

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {["url", "loading", "prompts", "competitors"].map((s, i, arr) => {
          const stepIndex = ["url", "loading", "prompts", "competitors"].indexOf(step);
          const isActive = i <= stepIndex;
          return (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  "size-2 rounded-full transition-all duration-500",
                  isActive ? "bg-primary scale-100" : "bg-border scale-75"
                )}
              />
              {i < arr.length - 1 && (
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
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <InputGroupText className="text-muted-foreground select-none">
                    https://
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="websiteUrl"
                  name="websiteUrl"
                  type="text"
                  placeholder="example.com"
                  value={websiteUrl}
                  onChange={(e) =>
                    setWebsiteUrl(
                      e.target.value.replace(/^https?:\/\//, "")
                    )
                  }
                  autoComplete="url"
                  disabled={isLoading}
                  required
                />
              </InputGroup>
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
              <LanguageCombobox
                id="language"
                value={language}
                onValueChange={(val) => setLanguage(val || DEFAULT_LANGUAGE)}
                disabled={isLoading}
                aria-invalid={!!errors.language}
              />
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
              onClick={handlePromptsNext}
              disabled={isLoading || selectedCount === 0}
              className="flex-1 gap-2"
            >
              Continue
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Competitors Step */}
      {step === "competitors" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-5">
          {/* Header */}
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 mb-2">
              <Swords className="size-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground text-balance">
              Track your competitors
            </h1>
            <p className="text-muted-foreground text-sm text-balance max-w-sm">
              Add up to {MAX_COMPETITORS} competitors to compare your visibility
              scores against. You can always add more later.
            </p>
          </div>

          {/* Competitor list */}
          {competitors.length > 0 && (
            <div className="flex flex-col gap-2">
              {competitors.map((competitor, index) => (
                <div
                  key={`${competitor.websiteUrl}-${index}`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground truncate">
                      {competitor.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {competitor.websiteUrl}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 size-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeCompetitor(index)}
                  >
                    <X className="size-4" />
                    <span className="sr-only">Remove {competitor.name}</span>
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add competitor form */}
          {competitors.length < MAX_COMPETITORS ? (
            <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border p-4">
              <p className="text-sm font-medium text-foreground">
                Add a competitor
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                  <Input
                    placeholder="Competitor name (e.g. Acme Corp)"
                    value={competitorName}
                    onChange={(e) => setCompetitorName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCompetitor();
                      }
                    }}
                  />
                  {competitorErrors.name && (
                    <p className="text-xs text-destructive">
                      {competitorErrors.name}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <div className="flex flex-col gap-1 flex-1">
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <InputGroupText className="text-muted-foreground select-none">
                          https://
                        </InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        placeholder="competitor.com"
                        value={competitorUrl}
                        onChange={(e) =>
                          setCompetitorUrl(
                            e.target.value.replace(/^https?:\/\//, "")
                          )
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addCompetitor();
                          }
                        }}
                      />
                    </InputGroup>
                    {competitorErrors.websiteUrl && (
                      <p className="text-xs text-destructive">
                        {competitorErrors.websiteUrl}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addCompetitor}
                    disabled={!competitorName.trim() || !competitorUrl.trim()}
                    className="shrink-0"
                  >
                    <Plus className="size-4" />
                    <span className="sr-only">Add competitor</span>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-muted/50 px-4 py-2.5 text-center">
              <span className="text-sm text-muted-foreground">
                Maximum of {MAX_COMPETITORS} competitors reached
              </span>
            </div>
          )}

          {/* Counter */}
          <div className="flex items-center justify-center">
            <span className="text-xs text-muted-foreground tabular-nums">
              {competitors.length} / {MAX_COMPETITORS} competitors added
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("prompts")}
              disabled={isLoading}
              className="flex-1 gap-2"
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating project...
                </>
              ) : competitors.length === 0 ? (
                <>
                  Skip & Finish
                  <ArrowRight className="size-4" />
                </>
              ) : (
                <>
                  Finish
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
