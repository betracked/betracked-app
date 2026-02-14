"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, X, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { LANGUAGES, type Language, DEFAULT_LANGUAGE } from "@/lib/languages";

interface LanguageComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  "aria-invalid"?: boolean;
  id?: string;
}

export function LanguageCombobox({
  value,
  onValueChange,
  disabled = false,
  id,
  ...props
}: LanguageComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const selectedLang = LANGUAGES.find((l) => l.code === value);

  const filtered = search.trim()
    ? LANGUAGES.filter((lang) => {
        const q = search.toLowerCase();
        return (
          lang.name.toLowerCase().includes(q) ||
          (lang.nativeName?.toLowerCase().includes(q) ?? false) ||
          lang.code.toLowerCase().includes(q)
        );
      })
    : LANGUAGES;

  // Reset highlight when filtered results change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filtered.length, search]);

  const handleSelect = useCallback(
    (lang: Language) => {
      onValueChange(lang.code);
      setSearch("");
      setOpen(false);
    },
    [onValueChange]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onValueChange(DEFAULT_LANGUAGE);
      setSearch("");
    },
    [onValueChange]
  );

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex < 0 || !listRef.current) return;
    const items = listRef.current.querySelectorAll("[data-lang-item]");
    items[highlightedIndex]?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) {
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOpen(true);
          return;
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < filtered.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : filtered.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && filtered[highlightedIndex]) {
            handleSelect(filtered[highlightedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setOpen(false);
          setSearch("");
          break;
      }
    },
    [open, filtered, highlightedIndex, handleSelect]
  );

  // When opening, focus the search input
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger button */}
      <button
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-invalid={props["aria-invalid"]}
        disabled={disabled}
        onClick={() => {
          if (!disabled) setOpen(!open);
        }}
        className={cn(
          "border-input bg-background ring-ring/10 flex h-9 w-full items-center justify-between rounded-lg border px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow]",
          "focus-visible:ring-ring focus-visible:ring-4 focus-visible:outline-1",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
          open && "ring-ring ring-4 outline-1"
        )}
      >
        {selectedLang ? (
          <span className="flex items-center gap-2 truncate">
            <span className="text-base leading-none">{selectedLang.flag}</span>
            <span className="truncate">{selectedLang.name}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">Select a language</span>
        )}
        <span className="flex items-center gap-1">
          {value && value !== DEFAULT_LANGUAGE && (
            <span
              role="button"
              tabIndex={-1}
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground rounded-sm p-0.5 transition-colors"
            >
              <X className="size-3.5" />
            </span>
          )}
          <ChevronsUpDown className="text-muted-foreground size-4 shrink-0" />
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={cn(
            "bg-popover text-popover-foreground ring-foreground/10 absolute z-50 mt-1.5 w-full overflow-hidden rounded-lg shadow-md ring-1",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2"
          )}
        >
          {/* Search input */}
          <div className="border-border/50 flex items-center gap-2 border-b px-3 py-2">
            <Search className="text-muted-foreground size-4 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              className="placeholder:text-muted-foreground w-full bg-transparent text-sm outline-none"
              placeholder="Search languages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Search languages"
              autoComplete="off"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Options list */}
          <div
            ref={listRef}
            role="listbox"
            aria-label="Languages"
            className="max-h-60 overflow-y-auto overscroll-contain p-1"
          >
            {filtered.length === 0 ? (
              <div className="text-muted-foreground py-6 text-center text-sm">
                No language found
              </div>
            ) : (
              filtered.map((lang, index) => (
                <div
                  key={lang.code}
                  data-lang-item
                  role="option"
                  aria-selected={lang.code === value}
                  onClick={() => handleSelect(lang)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={cn(
                    "relative flex cursor-default items-center gap-2.5 rounded-md py-1.5 pr-8 pl-2 text-sm outline-none select-none",
                    highlightedIndex === index &&
                      "bg-accent text-accent-foreground",
                    lang.code === value && "font-medium"
                  )}
                >
                  <span className="text-lg leading-none shrink-0">{lang.flag}</span>
                  <span className="flex flex-col">
                    <span className="text-sm leading-tight">{lang.name}</span>
                    {lang.nativeName && (
                      <span
                        className={cn(
                          "text-xs leading-tight",
                          highlightedIndex === index
                            ? "text-accent-foreground/70"
                            : "text-muted-foreground"
                        )}
                      >
                        {lang.nativeName}
                      </span>
                    )}
                  </span>
                  {lang.code === value && (
                    <span className="absolute right-2 flex size-4 items-center justify-center">
                      <Check className="size-4" />
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
