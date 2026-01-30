/**
 * Root application component
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import { HomePage } from "@/components/HomePage";
import { ProjectEditor } from "./ProjectEditor";

// Parse URL to get slug
function getSlugFromUrl(): string | null {
  const path = window.location.pathname;

  // Check for /<slug> pattern (not /slides/<slug>)
  const match = path.match(/^\/([a-zA-Z0-9_-]+)$/);
  if (match?.[1]) {
    return match[1];
  }

  // Also support legacy /slides/<slug> pattern
  const legacyMatch = path.match(/^\/slides\/([a-zA-Z0-9_-]+)/);
  if (legacyMatch?.[1]) {
    return legacyMatch[1];
  }

  return null;
}

export function App(): JSX.Element {
  // Get initial slug from URL
  const initialSlug = useMemo(() => getSlugFromUrl(), []);
  const [currentSlug, setCurrentSlug] = useState<string | null>(initialSlug);
  // Pending title for newly created projects
  const [pendingTitle, setPendingTitle] = useState<string | null>(null);

  // Handle project selection
  const handleSelectProject = useCallback((slug: string, title?: string) => {
    // Update URL without reload
    window.history.pushState({}, "", `/${slug}`);
    setCurrentSlug(slug);
    // Set pending title if this is a new project
    setPendingTitle(title || null);
  }, []);

  // Handle back to home
  const handleBackToHome = useCallback(() => {
    window.history.pushState({}, "", "/");
    setCurrentSlug(null);
    setPendingTitle(null);
  }, []);

  // Listen for browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentSlug(getSlugFromUrl());
      setPendingTitle(null);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Show HomePage if no slug selected
  if (!currentSlug) {
    return <HomePage onSelectProject={handleSelectProject} />;
  }

  // Show ProjectEditor for selected project
  return (
    <ProjectEditor
      slug={currentSlug}
      pendingTitle={pendingTitle}
      onBackToHome={handleBackToHome}
      onTitleApplied={() => setPendingTitle(null)}
    />
  );
}
