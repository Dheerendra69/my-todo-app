"use client";

import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Plus,
} from "lucide-react";

import FieldsPopover, {
  ViewMode,
} from "../FieldsPopover/FieldsPopOver";

import TaskFilter from "../TaskFilter/TaskFilter";

type BoardActionsProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  addButtonLabel: string;
  onAdd: () => void;
};

export default function BoardActions({
  viewMode,
  onViewModeChange,
  addButtonLabel,
  onAdd,
}: BoardActionsProps) {
  const [isFieldsOpen, setIsFieldsOpen] =
    useState(false);

  return (
    <div className="relative flex items-center gap-2">
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--surface-secondary)]"
      >
        <Search
          size={14}
          strokeWidth={2}
        />
      </button>

      <button
        type="button"
        onClick={() =>
          setIsFieldsOpen(
            (previous) => !previous,
          )
        }
        className={`
                    flex h-9 items-center gap-2
                    rounded-md border px-3 text-sm
                    ${isFieldsOpen
            ? "border-[#D4D4D4] bg-[var(--surface-secondary)]"
            : "border-[var(--border)] bg-[var(--background)]"
          }
                    hover:bg-[var(--surface-secondary)]
                `}
      >
        <SlidersHorizontal
          size={15}
          strokeWidth={2}
        />

        <span>Fields</span>
      </button>

      <TaskFilter />

      <FieldsPopover
        open={isFieldsOpen}
        onClose={() =>
          setIsFieldsOpen(false)
        }
        viewMode={viewMode}
        onViewModeChange={(mode) => {
          onViewModeChange(mode);
        }}
      />

      <button
        type="button"
        onClick={onAdd}
        className="flex h-9 items-center gap-2 rounded-md bg-[#171717] px-3 text-sm font-medium text-white hover:bg-[#262626]"
      >
        <Plus
          size={15}
          strokeWidth={2}
        />

        <span>{addButtonLabel}</span>
      </button>
    </div>
  );
}