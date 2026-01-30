/**
 * Editable title input component
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { useDebounce } from "@/hooks";
import { cn } from "@/utils";

interface TitleInputProps {
  title: string;
  onTitleChange: (title: string) => void;
}

export function TitleInput({ title, onTitleChange }: TitleInputProps): JSX.Element {
  const [value, setValue] = useState(title);
  const [isEditing, setIsEditing] = useState(false);
  const debouncedValue = useDebounce(value, 500);
  // Track if user has actually edited the input
  const userEditedRef = useRef(false);

  // Sync with prop (external title changes)
  useEffect(() => {
    setValue(title);
    // Reset user edited flag when title is externally updated
    userEditedRef.current = false;
  }, [title]);

  // Handle user input
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    userEditedRef.current = true;
    setValue(e.target.value);
  }, []);

  // Save on debounced change - only if user actually edited
  useEffect(() => {
    if (userEditedRef.current && debouncedValue !== title && debouncedValue.trim()) {
      onTitleChange(debouncedValue);
    }
  }, [debouncedValue, title, onTitleChange]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (userEditedRef.current && value.trim() && value !== title) {
      onTitleChange(value);
    }
  }, [value, title, onTitleChange]);

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      onFocus={() => setIsEditing(true)}
      onBlur={handleBlur}
      className={cn(
        "bg-transparent font-bold uppercase tracking-wider text-[var(--md-ink)]",
        "border-b-2 border-transparent px-1 py-0.5",
        "focus:border-[var(--md-sky-strong)] focus:outline-none",
        "transition-colors duration-200",
        isEditing && "border-[var(--md-sky)]"
      )}
      placeholder="Untitled"
      aria-label="Project title"
    />
  );
}
