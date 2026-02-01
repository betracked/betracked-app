"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/lib/auth";
import { ProjectProvider } from "@/lib/project-context";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <ProjectProvider>
          {children}
          <Toaster position="top-right" />
        </ProjectProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
