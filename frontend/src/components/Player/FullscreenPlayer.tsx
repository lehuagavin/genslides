/**
 * Fullscreen player component for presentations
 */

import { useEffect } from "react";
import { usePlayerStore, useSlidesStore } from "@/stores";
import { cn } from "@/utils";

export function FullscreenPlayer(): JSX.Element | null {
  const { isFullscreen, currentIndex, isPlaying, next, prev, exitFullscreen, pause, play } =
    usePlayerStore();
  const { slides, displayedImageHash } = useSlidesStore();

  // Note: Keyboard navigation is handled by useKeyboard hook in ProjectEditor
  // to avoid duplicate event handlers

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  // Auto-advance when playing
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      if (currentIndex < slides.length - 1) {
        next();
      } else {
        pause();
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [isPlaying, currentIndex, slides.length, next, pause]);

  if (!isFullscreen) return null;

  const currentSlide = slides[currentIndex];

  // Get the displayed image for current slide (respects user selection)
  const getDisplayedImage = () => {
    if (!currentSlide) return null;
    const hash = displayedImageHash[currentSlide.sid];
    if (hash && currentSlide.images) {
      const found = currentSlide.images.find((img) => img.hash === hash);
      if (found) return found;
    }
    // Fallback to current_image
    return currentSlide.current_image;
  };

  const displayedImage = getDisplayedImage();

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Main content */}
      <div className="flex h-full items-center justify-center">
        {displayedImage ? (
          <img
            src={displayedImage.url}
            alt={`Slide ${currentIndex + 1}`}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-4 opacity-50"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <p className="text-lg">No image for this slide</p>
          </div>
        )}
      </div>

      {/* Navigation controls */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent p-6">
        {/* Slide counter */}
        <div className="text-sm text-white/80">
          {currentIndex + 1} / {slides.length}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={prev}
            disabled={currentIndex === 0}
            className={cn(
              "rounded-full p-2 transition-colors",
              currentIndex === 0
                ? "text-white/30"
                : "text-white hover:bg-white/20"
            )}
            aria-label="Previous slide"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            onClick={() => (isPlaying ? pause() : play())}
            className="rounded-full bg-white/20 p-3 text-white transition-colors hover:bg-white/30"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>

          <button
            onClick={next}
            disabled={currentIndex >= slides.length - 1}
            className={cn(
              "rounded-full p-2 transition-colors",
              currentIndex >= slides.length - 1
                ? "text-white/30"
                : "text-white hover:bg-white/20"
            )}
            aria-label="Next slide"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Exit button */}
        <button
          onClick={exitFullscreen}
          className="text-sm text-white/80 transition-colors hover:text-white"
        >
          Press ESC to exit
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div
          className="h-full bg-[var(--md-sky)] transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / slides.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
