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

type BoardActionsProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
};

export default function BoardActions({
  viewMode,
  onViewModeChange,
}: BoardActionsProps) {
  const [isFieldsOpen, setIsFieldsOpen] = useState(false);

  return (
    <div className="relative flex items-center gap-2">
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-md border border-[#E5E5E5] bg-white hover:bg-[#F5F5F5]"
      >
        <Search size={14} strokeWidth={2} />
      </button>

      <button
        type="button"
        onClick={() => setIsFieldsOpen((previous) => !previous)}
        className={`
          flex h-9 items-center gap-2
          rounded-md border px-3 text-sm
          ${isFieldsOpen
            ? "border-[#D4D4D4] bg-[#F5F5F5]"
            : "border-[#E5E5E5] bg-white"
          }
          hover:bg-[#F5F5F5]
        `}
      >
        <SlidersHorizontal size={15} strokeWidth={2} />
        <span>Fields</span>
      </button>

      <FieldsPopover
        open={isFieldsOpen}
        onClose={() => setIsFieldsOpen(false)}
        viewMode={viewMode}
        onViewModeChange={(mode) => {
          onViewModeChange(mode);
        }}
      />

      <button
        type="button"
        className="flex h-9 items-center gap-2 rounded-md bg-[#171717] px-3 text-sm font-medium text-white hover:bg-[#262626]"
      >
        <Plus size={15} strokeWidth={2} />
        <span>Add Task</span>
      </button>
    </div>
  );
}