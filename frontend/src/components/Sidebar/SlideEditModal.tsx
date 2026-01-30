/**
 * Modal for editing slide content
 */

import { useState, useEffect, useRef } from "react";
import { Modal, Button, Textarea } from "@/components/common";

interface SlideEditModalProps {
  isOpen: boolean;
  slideIndex: number;
  content: string;
  onSave: (content: string) => void;
  onClose: () => void;
}

export function SlideEditModal({
  isOpen,
  slideIndex,
  content,
  onSave,
  onClose,
}: SlideEditModalProps): JSX.Element {
  const [editContent, setEditContent] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset content when modal opens
  useEffect(() => {
    if (isOpen) {
      setEditContent(content);
      // Focus textarea after a short delay for animation
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      }, 100);
    }
  }, [isOpen, content]);

  const handleSave = () => {
    // Only save if content actually changed
    if (editContent !== content) {
      onSave(editContent);
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSave();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Slide ${slideIndex + 1}`} size="lg">
      <div className="flex flex-col gap-4">
        <Textarea
          ref={textareaRef}
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter slide content..."
          className="min-h-[320px] resize-y text-base leading-relaxed"
          rows={12}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--md-slate)]">
            Tip: Ctrl+Enter to save, Esc to cancel
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
