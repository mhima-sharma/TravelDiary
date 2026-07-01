"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { rankOptions } from "@/lib/search/rank-options";

export interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  name?: string;
  id?: string;
  "aria-label"?: string;
  className?: string;
  maxResults?: number;
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyMessage = "No results found.",
  disabled = false,
  loading = false,
  error = null,
  onRetry,
  name,
  id,
  "aria-label": ariaLabel,
  className,
  maxResults = 150,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const visibleOptions = useMemo(() => rankOptions(options, query, maxResults), [options, query, maxResults]);
  const isDisabled = disabled || loading;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      {name && <input type="hidden" name={name} value={value} />}
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          disabled={isDisabled}
          aria-label={ariaLabel}
          aria-expanded={open}
          className={cn(
            "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors",
            "hover:bg-accent/50",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-background",
            className
          )}
        >
          <span className={cn("truncate text-left", !value && "text-muted-foreground")}>
            {loading ? "Loading…" : value || placeholder}
          </span>
          <span className="flex shrink-0 items-center gap-1">
            {value && !isDisabled && (
              <span
                role="button"
                tabIndex={-1}
                aria-label="Clear selection"
                className="rounded-sm p-0.5 opacity-50 hover:bg-muted hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin opacity-50" />
            ) : (
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            )}
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder={searchPlaceholder} value={query} onValueChange={setQuery} />
          {error ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <p className="px-4 text-sm text-muted-foreground">{error}</p>
              {onRetry && (
                <Button type="button" size="sm" variant="outline" onClick={onRetry}>
                  Try again
                </Button>
              )}
            </div>
          ) : (
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              {visibleOptions.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => {
                    onChange(option === value ? "" : option);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === option ? "opacity-100" : "opacity-0")} />
                  {option}
                </CommandItem>
              ))}
            </CommandList>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
