/**
 * HomePage component - Project selection and creation
 */

import { useState, useEffect, useCallback } from "react";
import { Logo } from "@/components/Header";
import { Button, Loading, Modal } from "@/components/common";
import { slidesApi } from "@/api";
import type { ProjectSummary } from "@/types";
import { cn } from "@/utils";

interface HomePageProps {
  onSelectProject: (slug: string, title?: string) => void;
}

// Generate a unique slug from project name (ASCII only for backend compatibility)
function generateUniqueSlug(name: string): string {
  // Convert to slug format - only keep ASCII letters, numbers, and hyphens
  const baseSlug = name
    .trim()
    .toLowerCase()
    // Only keep ASCII letters, numbers, spaces, and hyphens
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens

  // Add timestamp for uniqueness
  const timestamp = Date.now().toString(36).slice(-6);

  // If no valid ASCII chars, use "project" as prefix
  if (!baseSlug) {
    return `project-${timestamp}`;
  }

  return `${baseSlug}-${timestamp}`;
}

export function HomePage({ onSelectProject }: HomePageProps): JSX.Element {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProjectSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load projects on mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoading(true);
        const response = await slidesApi.listProjects();
        setProjects(response.projects);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load projects");
      } finally {
        setIsLoading(false);
      }
    };
    loadProjects();
  }, []);

  // Handle create new project
  const handleCreateProject = useCallback(async () => {
    const trimmedName = newProjectName.trim();
    if (!trimmedName) return;

    const slug = generateUniqueSlug(trimmedName);
    if (!slug) return;

    setIsCreating(true);
    try {
      // Navigate to the new project with the original name as title
      onSelectProject(slug, trimmedName);
    } finally {
      setIsCreating(false);
    }
  }, [newProjectName, onSelectProject]);

  // Handle delete project
  const handleDeleteProject = useCallback(async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await slidesApi.deleteProject(deleteTarget.slug);
      setProjects((prev) => prev.filter((p) => p.slug !== deleteTarget.slug));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget]);

  // Handle key press in input
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleCreateProject();
      }
    },
    [handleCreateProject]
  );

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="md-shell flex h-screen items-center justify-center">
        <Loading size="lg" text="Loading projects..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="md-shell flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-[var(--md-watermelon)]">
            Error Loading Projects
          </h1>
          <p className="text-[var(--md-slate)]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="md-shell flex min-h-screen flex-col">
      {/* Header */}
      <header className="md-eyebrow">
        <Logo />
        <div className="text-sm text-[var(--md-slate)]">
          AI-Powered Slide Generation
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="w-full max-w-3xl">
          {/* Create new project section */}
          <div className="mb-12">
            <h2 className="mb-4 text-lg font-bold uppercase tracking-wider">
              Create New Project
            </h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Enter project name..."
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="md-input flex-1"
                disabled={isCreating}
              />
              <Button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim() || isCreating}
              >
                {isCreating ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>

          {/* Existing projects section */}
          {projects.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-bold uppercase tracking-wider">
                Existing Projects ({projects.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {projects.map((project) => (
                  <div
                    key={project.slug}
                    className={cn(
                      "md-card group relative",
                      "flex flex-col p-4 transition-shadow hover:shadow-lg"
                    )}
                  >
                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(project);
                      }}
                      className={cn(
                        "absolute right-2 top-2 p-1.5 rounded",
                        "text-[var(--md-slate)] hover:text-[var(--md-watermelon)]",
                        "hover:bg-[var(--md-watermelon)]/10",
                        "opacity-0 group-hover:opacity-100 transition-opacity"
                      )}
                      title="Delete project"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4m2 0v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4h9.334z" />
                        <path d="M6.667 7.333v4M9.333 7.333v4" />
                      </svg>
                    </button>

                    {/* Project info - clickable */}
                    <button
                      onClick={() => onSelectProject(project.slug)}
                      className="flex flex-1 flex-col text-left"
                    >
                      <h3 className="font-bold text-[var(--md-ink)] pr-6 line-clamp-2">
                        {project.title || project.slug}
                      </h3>
                      <div className="mt-2 flex items-center gap-2 text-xs text-[var(--md-slate)]">
                        <span className="flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                            <rect x="1" y="2" width="10" height="8" rx="1" opacity="0.3" />
                            <rect x="2" y="3" width="8" height="6" rx="0.5" />
                          </svg>
                          {project.slide_count} slide{project.slide_count !== 1 ? "s" : ""}
                        </span>
                        {project.has_style && (
                          <span className="flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                              <circle cx="6" cy="6" r="5" opacity="0.3" />
                              <circle cx="6" cy="6" r="3" />
                            </svg>
                            Styled
                          </span>
                        )}
                      </div>
                      <div className="mt-auto pt-3 text-xs text-[var(--md-slate)]">
                        Updated {formatDate(project.updated_at)}
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {projects.length === 0 && (
            <div className="text-center text-[var(--md-slate)]">
              <p>No existing projects found.</p>
              <p className="mt-2">Create your first project above!</p>
            </div>
          )}
        </div>
      </main>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Project"
      >
        <div className="space-y-4">
          <p className="text-[var(--md-ink)]">
            Are you sure you want to delete{" "}
            <span className="font-bold">
              {deleteTarget?.title || deleteTarget?.slug}
            </span>
            ?
          </p>
          <p className="text-sm text-[var(--md-slate)]">
            This action cannot be undone. All slides and generated images will be
            permanently deleted.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteProject}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
