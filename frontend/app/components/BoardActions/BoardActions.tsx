"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Search,
  SlidersHorizontal,
  Plus,
  X,
} from "lucide-react";

import FieldsPopover, {
  ViewMode,
  SelectedFields,
} from "../FieldsPopover/FieldsPopOver";

import TaskFilter, {
  type FilterState,
} from "../TaskFilter/TaskFilter";

type BoardActionsProps = {
  viewMode: ViewMode;

  onViewModeChange: (
    mode: ViewMode,
  ) => void;

  selectedFields: SelectedFields;

  onSelectedFieldsChange: (
    fields: SelectedFields,
  ) => void;

  addButtonLabel: string;

  onAdd: () => void;

  onFilterChange?: (
    filters: FilterState,
  ) => void;

  searchValue?: string;

  onSearchChange?: (
    value: string,
  ) => void;
};

export default function BoardActions({
  viewMode,
  onViewModeChange,
  selectedFields,
  onSelectedFieldsChange,
  addButtonLabel,
  onAdd,
  onFilterChange,
  searchValue = "",
  onSearchChange,
}: BoardActionsProps) {
  const [
    isFieldsOpen,
    setIsFieldsOpen,
  ] = useState(false);

  const [
    isSearchOpen,
    setIsSearchOpen,
  ] = useState(false);

  const inputRef =
    useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      inputRef.current?.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (
        (event.metaKey ||
          event.ctrlKey) &&
        event.key.toLowerCase() ===
        "f"
      ) {
        event.preventDefault();

        setIsSearchOpen(true);

        requestAnimationFrame(() => {
          inputRef.current?.focus();
        });
      }

      if (
        event.key === "Escape" &&
        isSearchOpen
      ) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [isSearchOpen]);

  const closeSearch = () => {
    setIsSearchOpen(false);

    onSearchChange?.("");
  };

  return (
    <div className="relative flex flex-wrap items-center gap-2">
      {/* SEARCH */}

      {isSearchOpen ? (
        <div className="order-last flex h-9 basis-full items-center gap-1.5 rounded border border-border bg-background px-3 md:order-0 md:h-8 md:w-93.25 md:basis-auto">
          <Search
            size={16}
            strokeWidth={2}
            className="shrink-0 text-foreground-secondary"
          />

          <input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={(event) =>
              onSearchChange?.(
                event.target.value,
              )
            }
            placeholder="Search..."
            className="h-5 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground-secondary"
          />

          {searchValue ? (
            <button
              type="button"
              onClick={() =>
                onSearchChange?.("")
              }
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded hover:bg-surface-secondary"
            >
              <X
                size={14}
                strokeWidth={2}
              />
            </button>
          ) : (
            <button
              type="button"
              onClick={closeSearch}
              className="flex h-5.5 min-w-7.75 shrink-0 items-center justify-center rounded-sm bg-surface-secondary px-1.5 text-xs font-medium text-foreground"
            >
              ⌘F
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() =>
            setIsSearchOpen(true)
          }
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-surface-secondary"
        >
          <Search
            size={14}
            strokeWidth={2}
          />
        </button>
      )}

      {/* FIELDS */}

      <button
        type="button"
        onClick={() =>
          setIsFieldsOpen(
            (previous) =>
              !previous,
          )
        }
        className={`flex h-9 shrink-0 items-center gap-2 rounded-md border px-3 text-sm ${isFieldsOpen
          ? "border-[#D4D4D4] bg-surface-secondary"
          : "border-border bg-background"
          } hover:bg-surface-secondary`}
      >
        <SlidersHorizontal
          size={15}
          strokeWidth={2}
        />

        <span className="whitespace-nowrap">
          Fields
        </span>
      </button>

      <TaskFilter
        onChange={onFilterChange}
      />

      {/* FIELDS POPOVER */}

      <FieldsPopover
        open={isFieldsOpen}
        onClose={() =>
          setIsFieldsOpen(false)
        }
        viewMode={viewMode}
        onViewModeChange={
          onViewModeChange
        }
        selectedFields={
          selectedFields
        }
        onSelectedFieldsChange={
          onSelectedFieldsChange
        }
      />

      {/* ADD */}

      <button
        type="button"
        onClick={onAdd}
        className="flex h-9 shrink-0 items-center gap-2 rounded-md bg-[#171717] px-3 text-sm font-medium text-white hover:bg-[#262626]"
      >
        <Plus
          size={15}
          strokeWidth={2}
          className="shrink-0"
        />

        <span className="whitespace-nowrap">
          {addButtonLabel}
        </span>
      </button>
    </div>
  );
}