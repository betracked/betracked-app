import { Suspense } from "react";
import Link from "next/link";
import { OnboardingForm } from "@/components/onboarding-form";
import { OnboardingGuard } from "./onboarding-guard";
import { GalleryVerticalEnd, Loader2 } from "lucide-react";

export default function OnboardingPage() {
  return (
    <OnboardingGuard>
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left panel - form */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link
            href="/"
            className="flex items-center gap-2 font-medium text-foreground"
          >
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            betracked.
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <Suspense
              fallback={
                <div className="flex items-center justify-center">
                  <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
              }
            >
              <OnboardingForm />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Right panel - decorative */}
      <div className="relative hidden lg:flex lg:items-center lg:justify-center bg-muted overflow-hidden">
        {/* Decorative background pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 size-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 size-48 rounded-full bg-primary/8 blur-2xl" />
        </div>
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-8 px-12 text-center max-w-lg">
          <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/10">
            <GalleryVerticalEnd className="size-10 text-primary" />
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-bold text-foreground text-balance">
              Understand your website like never before
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed text-balance">
              betracked uses AI-powered analysis prompts to evaluate your
              website across usability, design, accessibility, and conversion
              metrics.
            </p>
          </div>
          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {["Conversion Tracking", "Prompt Analysis", "Performance"].map(
              (feature) => (
                <span
                  key={feature}
                  className="rounded-full border border-border bg-card/60 px-3.5 py-1.5 text-xs font-medium text-foreground"
                >
                  {feature}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </div>
    </OnboardingGuard>
  );
}
