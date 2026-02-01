"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { X, Plus, Loader2 } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";

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

export function OnboardingForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { createProject, startAnalysis } = useProject();

  const [step, setStep] = useState<"url" | "prompts">("url");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<OnboardingFormData>>({});

  // Handle URL submission
  const handleUrlSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const data = { websiteUrl };

    // Validate URL
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

    // Load suggested prompts (placeholder)
    setSelectedPrompts(PLACEHOLDER_PROMPTS.slice(0, 5)); // Pre-select first 5
    setStep("prompts");
  };

  // Toggle prompt selection
  const togglePrompt = (prompt: string) => {
    setSelectedPrompts((prev) =>
      prev.includes(prompt)
        ? prev.filter((p) => p !== prompt)
        : [...prev, prompt]
    );
  };

  // Add custom prompt
  const addCustomPrompt = () => {
    if (!customPrompt.trim()) return;
    if (selectedPrompts.includes(customPrompt.trim())) {
      toast.error("This prompt already exists");
      return;
    }
    setSelectedPrompts((prev) => [...prev, customPrompt.trim()]);
    setCustomPrompt("");
  };

  // Remove prompt
  const removePrompt = (prompt: string) => {
    setSelectedPrompts((prev) => prev.filter((p) => p !== prompt));
  };

  // Handle final confirmation
  const handleConfirm = async () => {
    if (selectedPrompts.length === 0) {
      toast.error("Please select at least one prompt");
      return;
    }

    setIsLoading(true);

    try {
      // Create project with prompts via API
      await createProject(websiteUrl, selectedPrompts);

      toast.success("Project created! Starting analysis...");

      // Redirect to dashboard
      router.push("/");

      // Start analysis after a short delay (to allow redirect)
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
      {step === "url" && (
        <form onSubmit={handleUrlSubmit}>
          <FieldGroup>
            <div className="flex flex-col items-center gap-1 text-center">
              <h1 className="text-2xl font-bold">Welcome to betracked</h1>
              <p className="text-muted-foreground text-sm text-balance">
                Let&apos;s start by analyzing your website
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
                Enter the URL of the website you want to analyze
              </FieldDescription>
            </Field>
            <Field>
              <Button type="submit" disabled={isLoading}>
                Continue
              </Button>
            </Field>
          </FieldGroup>
        </form>
      )}

      {step === "prompts" && (
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Select analysis prompts</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Choose the aspects you want to analyze about your website
            </p>
          </div>

          {/* Suggested prompts */}
          <Field>
            <FieldLabel>Suggested prompts</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {PLACEHOLDER_PROMPTS.map((prompt) => (
                <Badge
                  key={prompt}
                  variant={
                    selectedPrompts.includes(prompt) ? "default" : "outline"
                  }
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => togglePrompt(prompt)}
                >
                  {prompt}
                </Badge>
              ))}
            </div>
            <FieldDescription>
              Click to select or deselect prompts
            </FieldDescription>
          </Field>

          {/* Selected prompts list */}
          {selectedPrompts.length > 0 && (
            <Field>
              <FieldLabel>Selected prompts ({selectedPrompts.length})</FieldLabel>
              <div className="bg-muted rounded-lg p-3 space-y-2">
                {selectedPrompts.map((prompt) => (
                  <div
                    key={prompt}
                    className="bg-background flex items-center justify-between gap-2 rounded-md p-2"
                  >
                    <span className="text-sm flex-1">{prompt}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePrompt(prompt)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Field>
          )}

          {/* Add custom prompt */}
          <Field>
            <FieldLabel>Add custom prompt</FieldLabel>
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
                onClick={addCustomPrompt}
                disabled={!customPrompt.trim() || isLoading}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </Field>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("url")}
              disabled={isLoading}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading || selectedPrompts.length === 0}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                "Start Analysis"
              )}
            </Button>
          </div>
        </FieldGroup>
      )}
    </div>
  );
}
