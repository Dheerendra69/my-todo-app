"use client";

import { useEffect, useRef, useState } from "react";
import { List, Grid2X2, Check } from "lucide-react";

export type ViewMode = "list" | "board";

const FIELD_OPTIONS = [
  "Priority",
  "Members",
  "Due Date",
  "Labels",
  "Status",
  "Reporter",
];

type SelectedFields = {
  list: string[];
  board: string[];
};

type FieldsPopoverProps = {
  open: boolean;
  onClose: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
};

export default function FieldsPopover({
  open,
  onClose,
  viewMode,
  onViewModeChange,
}: FieldsPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  const [selectedFields, setSelectedFields] =
    useState<SelectedFields>({
      list: ["Priority", "Members", "Due Date"],
      board: ["Members"],
    });

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  const currentFields = selectedFields[viewMode];

  const toggleField = (field: string) => {
    setSelectedFields((previous) => {
      const current = previous[viewMode];
      const isSelected = current.includes(field);

      return {
        ...previous,
        [viewMode]: isSelected
          ? current.filter((item) => item !== field)
          : [...current, field],
      };
    });
  };

  return (
    <div
      ref={popoverRef}
      className="
        absolute right-0 top-[calc(100%+8px)] z-50
        w-[299px]
        rounded-md
        border border-[var(--border)]
        bg-[var(--background)]
        p-4
        shadow-[0px_8px_16px_-4px_rgba(0,0,0,0.08),0px_4px_8px_-2px_rgba(0,0,0,0.06)]
      "
    >
      <div className="flex w-full flex-col gap-4">
        <div className="flex h-9 w-full">
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={`
              flex h-9 w-1/2 items-center justify-center
              gap-1 rounded-l-md
              border border-[var(--border)]
              px-3 text-sm font-medium
              ${viewMode === "list"
                ? "bg-[var(--surface-secondary)]"
                : "bg-[var(--background)] hover:bg-[var(--surface-secondary)]"
              }
            `}
          >
            <List size={16} strokeWidth={2} />
            <span>List</span>
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange("board")}
            className={`
              flex h-9 w-1/2 items-center justify-center
              gap-1 rounded-r-md
              border border-l-0 border-[var(--border)]
              px-3 text-sm font-medium
              ${viewMode === "board"
                ? "bg-[var(--surface-secondary)]"
                : "bg-[var(--background)] hover:bg-[var(--surface-secondary)]"
              }
            `}
          >
            <Grid2X2 size={16} strokeWidth={2} />
            <span>Board</span>
          </button>
        </div>

        <div className="flex w-full flex-col">
          {FIELD_OPTIONS.map((field) => {
            const selected = currentFields.includes(field);

            return (
              <button
                key={field}
                type="button"
                onClick={() => toggleField(field)}
                className="
                  flex h-8 min-h-8 w-full
                  items-center
                  rounded-md
                  text-left
                  hover:bg-[var(--surface-secondary)]
                "
              >
                <span className="text-sm font-normal leading-4 text-[var(--foreground)]">
                  {field}
                </span>

                <span
                  className={`
                    ml-auto flex h-4 w-4 shrink-0
                    items-center justify-center
                    rounded-[4px] border
                    ${selected
                      ? "border-[#171717] bg-[#171717]"
                      : "border-[#D4D4D4] bg-[#E5E5E5]"
                    }
                  `}
                >
                  {selected && (
                    <Check
                      size={12}
                      strokeWidth={2.5}
                      className="text-white"
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}