"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

// Types
export interface Prompt {
  id: string;
  text: string;
  status: "pending" | "analyzing" | "done";
  score?: number; // 0-100
  createdAt: string;
}

export interface Project {
  websiteUrl: string;
  prompts: Prompt[];
  createdAt: string;
}

interface ProjectContextType {
  project: Project | null;
  isLoading: boolean;
  createProject: (websiteUrl: string, prompts: string[]) => void;
  startAnalysis: () => void;
  clearProject: () => void;
}

const PROJECT_STORAGE_KEY = "betracked_project";

const ProjectContext = createContext<ProjectContextType | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load project from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PROJECT_STORAGE_KEY);
      if (stored) {
        setProject(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load project from localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save project to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading && project) {
      try {
        localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(project));
      } catch (error) {
        console.error("Failed to save project to localStorage:", error);
      }
    }
  }, [project, isLoading]);

  // Create a new project
  const createProject = useCallback((websiteUrl: string, promptTexts: string[]) => {
    const newProject: Project = {
      websiteUrl,
      prompts: promptTexts.map((text) => ({
        id: crypto.randomUUID(),
        text,
        status: "pending",
        createdAt: new Date().toISOString(),
      })),
      createdAt: new Date().toISOString(),
    };
    setProject(newProject);
  }, []);

  // Start analysis - simulate progress
  const startAnalysis = useCallback(() => {
    if (!project) return;

    // Set all prompts to analyzing
    const updatedProject = {
      ...project,
      prompts: project.prompts.map((p) => ({
        ...p,
        status: "analyzing" as const,
      })),
    };
    setProject(updatedProject);

    // Simulate analysis completion over time
    project.prompts.forEach((prompt, index) => {
      setTimeout(() => {
        setProject((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            prompts: prev.prompts.map((p) =>
              p.id === prompt.id
                ? {
                    ...p,
                    status: "done" as const,
                    score: Math.floor(Math.random() * 30) + 70, // Random score 70-100
                  }
                : p
            ),
          };
        });
      }, (index + 1) * 2000); // Stagger completion by 2 seconds each
    });
  }, [project]);

  // Clear project
  const clearProject = useCallback(() => {
    setProject(null);
    localStorage.removeItem(PROJECT_STORAGE_KEY);
  }, []);

  const value: ProjectContextType = {
    project,
    isLoading,
    createProject,
    startAnalysis,
    clearProject,
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
