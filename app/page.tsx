"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";
import { useProject } from "@/lib/project-context";
import { Loader2 } from "lucide-react";
import { PromptsList } from "@/components/prompts-list";
import getData from "./data";

export default function Page() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { activeProject, isLoading: projectLoading } = useProject();

  // Redirect to onboarding when user has not completed onboarding
  useEffect(() => {
    if (authLoading) return;
    if (user?.needsOnboarding) {
      router.push("/onboarding");
    }
  }, [authLoading, user?.needsOnboarding, router]);

  const data = getData();
  const isLoading = authLoading || projectLoading;

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Redirecting to onboarding (needsOnboarding === true)
  if (user?.needsOnboarding) {
    return null;
  }

  // No project yet (e.g. just finished onboarding, projects loading) – show loading or empty state
  if (!activeProject) {
    return null;
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <PromptsList />
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
