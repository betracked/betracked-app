"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface OnboardingPromptCardProps {
  prompt: string;
  isSelected: boolean;
  onToggle: () => void;
  onEdit: (newText: string) => void;
  onRemove: () => void;
  index: number;
  isCustom?: boolean;
}

export function OnboardingPromptCard({
  prompt,
  isSelected,
  onToggle,
  onEdit,
  onRemove,
  index,
  isCustom = false,
}: OnboardingPromptCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(prompt);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== prompt) {
      onEdit(trimmed);
    } else {
      setEditValue(prompt);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(prompt);
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 rounded-xl border p-4 transition-all duration-300",
        "hover:shadow-sm",
        isSelected
          ? "border-primary/30 bg-primary/[0.03]"
          : "border-border bg-card",
        isCustom && "border-dashed"
      )}
      style={{
        animationDelay: `${index * 80}ms`,
        animation: "onboardingFadeInUp 0.4s ease-out both",
      }}
    >
      {/* Checkbox */}
      <div className="pt-0.5">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggle}
          aria-label={`Select prompt: ${prompt}`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
              className="flex-1 bg-transparent text-sm text-foreground outline-none border-b border-primary/40 pb-0.5 focus:border-primary"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className="size-7 p-0 text-primary hover:text-primary"
            >
              <Check className="size-3.5" />
              <span className="sr-only">Save edit</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="size-7 p-0 text-muted-foreground"
            >
              <X className="size-3.5" />
              <span className="sr-only">Cancel edit</span>
            </Button>
          </div>
        ) : (
          <p
            className={cn(
              "text-sm leading-relaxed transition-colors",
              isSelected ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {prompt}
          </p>
        )}
      </div>

      {/* Actions */}
      {!isEditing && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="size-7 p-0 text-muted-foreground hover:text-foreground"
          >
            <Pencil className="size-3.5" />
            <span className="sr-only">Edit prompt</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="size-7 p-0 text-muted-foreground hover:text-destructive"
          >
            <X className="size-3.5" />
            <span className="sr-only">Remove prompt</span>
          </Button>
        </div>
      )}
    </div>
  );
}
