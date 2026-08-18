"use client";

import { ChevronRight, PanelLeft } from "lucide-react";

type TopBarProps = {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
};

export default function TopBar({
  isSidebarOpen,
  onToggleSidebar,
}: TopBarProps) {
  return (
    <header className="flex h-16 w-full items-center border-b border-[var(--border)] bg-[var(--background)] px-4">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full hover:bg-[var(--surface-secondary)]"
        >
          <PanelLeft size={16} strokeWidth={2} />
        </button>

        <div className="h-[15px] w-px shrink-0 bg-[#E5E5E5]" />

        <nav className="flex min-w-0 items-center gap-2 text-sm">
          <button
            type="button"
            className="shrink-0 text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
          >
            Projects
          </button>

          <ChevronRight
            size={15}
            strokeWidth={2}
            className="shrink-0 text-[var(--foreground-secondary)]"
          />

          <span className="truncate text-[var(--foreground)]">
            Design Homepage
          </span>
        </nav>
      </div>
    </header>
  );
}