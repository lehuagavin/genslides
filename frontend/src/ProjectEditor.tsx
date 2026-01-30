/**
 * ProjectEditor component - Main project editing interface
 */

import { useCallback, useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Preview } from "@/components/Preview";
import { FullscreenPlayer } from "@/components/Player";
import { StyleSetupModal, StyleSettingsModal } from "@/components/Modals";
import { ToastContainer, Loading, ErrorBoundary } from "@/components/common";
import { useSlides, useStyle, useWebSocket, useKeyboard, useImages } from "@/hooks";

interface ProjectEditorProps {
  slug: string;
  pendingTitle?: string | null;
  onBackToHome: () => void;
  onTitleApplied?: () => void;
}

export function ProjectEditor({
  slug,
  pendingTitle,
  onBackToHome,
  onTitleApplied,
}: ProjectEditorProps): JSX.Element {
  // Initialize hooks - pass pendingTitle to useSlides for initial title application
  const {
    slides,
    selectedSid,
    title,
    isLoading,
    error,
    selectSlide,
    updateTitle,
    createSlide,
    updateSlideContent,
    deleteSlide,
    reorderSlides,
  } = useSlides(slug, pendingTitle);

  // Notify parent when title has been applied
  useEffect(() => {
    if (pendingTitle && title === pendingTitle) {
      onTitleApplied?.();
    }
  }, [pendingTitle, title, onTitleApplied]);

  const { generateCandidates, saveStyle } = useStyle(slug);
  const { generateImage, deleteImage } = useImages(slug);

  // WebSocket connection for real-time updates
  useWebSocket(slug);

  // Handlers
  const handleAddSlide = useCallback(async (afterSid?: string) => {
    // afterSid is passed from useKeyboard (Enter key) or Sidebar button
    // If afterSid is provided, create after that slide; otherwise create at end
    await createSlide("New slide content", afterSid);
  }, [createSlide]);

  // Keyboard shortcuts - pass handleAddSlide for Enter key
  useKeyboard({ onCreateSlide: handleAddSlide });

  const handleContentChange = useCallback(
    (sid: string, content: string) => {
      updateSlideContent(sid, content);
    },
    [updateSlideContent]
  );

  const handleGenerate = useCallback(
    (sid: string) => {
      generateImage(sid);
    },
    [generateImage]
  );

  const handleDeleteImage = useCallback(
    (sid: string, imageHash: string) => {
      deleteImage(sid, imageHash);
    },
    [deleteImage]
  );

  const handleGenerateCandidates = useCallback(
    async (prompt: string) => {
      await generateCandidates(prompt);
    },
    [generateCandidates]
  );

  const handleSaveStyle = useCallback(
    async (candidateId: string) => {
      await saveStyle(candidateId);
    },
    [saveStyle]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="md-shell flex h-screen items-center justify-center">
        <Loading size="lg" text="Loading project..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="md-shell flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-[var(--md-watermelon)]">
            Error Loading Project
          </h1>
          <p className="mb-4 text-[var(--md-slate)]">{error}</p>
          <button
            onClick={onBackToHome}
            className="text-[var(--md-sky-strong)] hover:underline"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="md-shell flex h-screen flex-col">
        {/* Header */}
        <Header onTitleChange={updateTitle} onBackToHome={onBackToHome} />

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <ErrorBoundary>
            <Sidebar
              slides={slides}
              selectedSid={selectedSid}
              onSelect={selectSlide}
              onDelete={deleteSlide}
              onAddSlide={handleAddSlide}
              onContentChange={handleContentChange}
              onReorder={reorderSlides}
            />
          </ErrorBoundary>

          {/* Preview area */}
          <main className="flex-1 overflow-hidden">
            <ErrorBoundary>
              <Preview onGenerate={handleGenerate} onDeleteImage={handleDeleteImage} />
            </ErrorBoundary>
          </main>
        </div>

        {/* Fullscreen player */}
        <FullscreenPlayer />

        {/* Modals */}
        <StyleSetupModal
          slug={slug}
          onGenerateCandidates={handleGenerateCandidates}
          onSaveStyle={handleSaveStyle}
        />
        <StyleSettingsModal
          slug={slug}
          onGenerateCandidates={handleGenerateCandidates}
          onSaveStyle={handleSaveStyle}
        />

        {/* Toast notifications */}
        <ToastContainer />
      </div>
    </ErrorBoundary>
  );
}
