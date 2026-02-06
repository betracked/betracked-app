"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { api, getAccessToken } from "./api-client";
import type { ProjectResponseDto } from "./Api";
import { useAuth } from "./auth";

// Types
interface ProjectContextType {
  isLoading: boolean;
  createProject: (websiteUrl: string, prompts: string[]) => Promise<void>;
  clearProject: () => void;
  // API projects
  activeProject: ProjectResponseDto | null;
  projects: ProjectResponseDto[];
  loadProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  // API projects state
  const [projects, setProjects] = useState<ProjectResponseDto[]>([]);
  const [activeProject, setActiveProject] = useState<ProjectResponseDto | null>(
    null
  );

  // Load projects from API (only when user has access token)
  const loadProjects = useCallback(async () => {
    if (!getAccessToken()) {
      setProjects([]);
      setActiveProject(null);
      return;
    }
    try {
      const response = await api.api.projectsControllerGetMyProjects();
      const fetchedProjects = response.data;
      setProjects(fetchedProjects);

      // Use first project as active if available
      if (fetchedProjects.length > 0) {
        setActiveProject(fetchedProjects[0]);
      } else {
        setActiveProject(null);
      }
    } catch (error) {
      console.error("Failed to load projects from API:", error);
    }
  }, []);

  // Load projects only when signed in and not in onboarding.
  // Waits for auth to be ready, then loads when user is in the app (post-onboarding).
  useEffect(() => {
    if (authLoading) return;
    const shouldLoad = !!user && !user.needsOnboarding && !!getAccessToken();
    if (!shouldLoad) {
      setProjects([]);
      setActiveProject(null);
      setIsLoading(false);
      return;
    }

    const initializeProjects = async () => {
      try {
        await loadProjects();
      } catch (error) {
        console.error("Failed to load projects from API:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeProjects();
  }, [authLoading, user, loadProjects]);

  // Create a new project via API
  const createProject = useCallback(
    async (websiteUrl: string, promptTexts: string[]) => {
      try {
        // Call the onboarding API endpoint
        await api.api.onboardingControllerCreateProject({
          websiteUrl,
          prompts: promptTexts.map((text) => ({
            text,
          })),
        });

        // Reload projects list
        await loadProjects();
      } catch (error) {
        console.error("Failed to create project:", error);
        throw error;
      }
    },
    [loadProjects]
  );

  // Clear project
  const clearProject = useCallback(() => {
    setActiveProject(null);
  }, []);

  const value: ProjectContextType = {
    isLoading,
    createProject,
    clearProject,
    // API projects
    activeProject,
    projects,
    loadProjects,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
