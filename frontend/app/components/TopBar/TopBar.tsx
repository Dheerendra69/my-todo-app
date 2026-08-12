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
    <header className="flex h-16 w-full items-center border-b border-[#E5E5E5] bg-white px-4">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full hover:bg-[#F5F5F5]"
        >
          <PanelLeft size={16} strokeWidth={2} />
        </button>

        <div className="h-[15px] w-px shrink-0 bg-[#E5E5E5]" />

        <nav className="flex min-w-0 items-center gap-2 text-sm">
          <button
            type="button"
            className="shrink-0 text-[#737373] hover:text-[#171717]"
          >
            Projects
          </button>

          <ChevronRight
            size={15}
            strokeWidth={2}
            className="shrink-0 text-[#737373]"
          />

          <span className="truncate text-[#171717]">
            Design Homepage
          </span>
        </nav>
      </div>
    </header>
  );
}