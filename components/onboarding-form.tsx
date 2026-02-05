"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { Plus, Loader2, ArrowRight, ArrowLeft, Globe, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
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
import { OnboardingLoading } from "@/components/onboarding-loading";
import { OnboardingPromptCard } from "@/components/onboarding-prompt-card";

// Placeholder prompts (max 7 from backend)
const PLACEHOLDER_PROMPTS = [
  "How easy is it to find the pricing page?",
  "Can users understand what the product does within 5 seconds?",
  "Is the call-to-action button visible above the fold?",
  "How clear is the navigation structure?",
  "Are trust signals (reviews, logos) prominently displayed?",
  "Is the checkout process straightforward?",
  "How accessible is the contact information?",
];

// Validation schema
const urlSchema = z.object({
  websiteUrl: z.string().url("Please enter a valid URL"),
});

type OnboardingFormData = z.infer<typeof urlSchema>;
type Step = "url" | "loading" | "prompts";

export function OnboardingForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { createProject, startAnalysis } = useProject();

  const [step, setStep] = useState<Step>("url");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [prompts, setPrompts] = useState<{ text: string; selected: boolean; isCustom: boolean }[]>([]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<OnboardingFormData>>({});

  // Handle URL submission
  const handleUrlSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const data = { websiteUrl };
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

    // Move to loading transition
    setStep("loading");
  };

  // When loading animation completes
  const handleLoadingComplete = useCallback(() => {
    // Initialize prompts with first 5 pre-selected
    setPrompts(
      PLACEHOLDER_PROMPTS.map((text, i) => ({
        text,
        selected: i < 5,
        isCustom: false,
      }))
    );
    setStep("prompts");
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
      { text: customPrompt.trim(), selected: true, isCustom: true },
    ]);
    setCustomPrompt("");
  };

  // Selected count
  const selectedCount = prompts.filter((p) => p.selected).length;

  // Handle final confirmation
  const handleConfirm = async () => {
    const selectedPrompts = prompts.filter((p) => p.selected).map((p) => p.text);
    if (selectedPrompts.length === 0) {
      toast.error("Please select at least one prompt");
      return;
    }

    setIsLoading(true);

    try {
      await createProject(websiteUrl, selectedPrompts);
      toast.success("Project created! Starting analysis...");
      router.push("/");
      setTimeout(() => {
        startAnalysis();
      }, 500);
    } catch (error) {
      const apiError = error as { error?: { message?: string } };
      const message =
        apiError?.error?.message ||
        "Failed to create project. Please try again.";
      toast.error(message);
      setIsLoading(false);
    }
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
                    isActive && i < stepIndex
                      ? "bg-primary"
                      : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* URL Step */}
      {step === "url" && (
        <form onSubmit={handleUrlSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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

            <Field>
              <Button type="submit" className="w-full gap-2" disabled={isLoading}>
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
            onComplete={handleLoadingComplete}
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
            <FieldLabel className="text-sm font-medium">Add a custom prompt</FieldLabel>
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
                  Start Analysis
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
