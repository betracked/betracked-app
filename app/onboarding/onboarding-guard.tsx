"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";

/**
 * Redirects to / when user has already completed onboarding (needsOnboarding === false).
 * Renders children only when user still needs onboarding or auth is loading.
 */
export function OnboardingGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (user && !user.needsOnboarding) {
      router.replace("/");
    }
  }, [isLoading, user, router]);

  // Still loading auth
  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Already completed onboarding – redirecting
  if (user && !user.needsOnboarding) {
    return null;
  }

  return <>{children}</>;
}
