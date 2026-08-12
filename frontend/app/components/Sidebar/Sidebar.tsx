"use client";

import { useState } from "react";
import {
  ChevronsUpDown,
  ChevronDown,
  BriefcaseBusiness,
  CheckSquare,
} from "lucide-react";

const navigation = [
  {
    label: "Tasks",
    icon: CheckSquare,
    active: true,
  },
  {
    label: "Projects",
    icon: BriefcaseBusiness,
    active: false,
  },
];

export default function Sidebar() {
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(true);

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-[#E5E5E5] bg-[#FAFAFA] md:block">
      <div className="flex h-16 w-full items-center p-2">
        <button className="flex h-12 w-full items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-[#F5F5F5]">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#FFFFFF]">
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#ff7b72] via-[#b55cff] to-[#3b82f6] text-sm font-semibold text-white">
              D
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <span className="truncate text-sm font-medium leading-5 text-[#0A0A0A]">
              Dexter
            </span>
          </div>

          <ChevronsUpDown
            size={16}
            strokeWidth={2}
            className="shrink-0 text-[#171717]"
          />
        </button>
      </div>

      <div className="w-full p-2">
        <button
          onClick={() => setIsWorkspaceOpen((prev) => !prev)}
          className="flex h-8 w-full items-center justify-between rounded-xl px-3 text-left hover:bg-[#F5F5F5]"
        >
          <span className="text-sm font-medium leading-5 text-[#0A0A0A]">
            Workspace
          </span>

          {isWorkspaceOpen ? (
            <ChevronDown
              size={16}
              strokeWidth={2}
              className="text-[#171717]"
            />
          ) : (
            <ChevronDown
              size={16}
              strokeWidth={2}
              className="rotate-180 text-[#171717]"
            />
          )}
        </button>
      </div>

      {isWorkspaceOpen && (
        <nav className="w-full px-2">
          <div className="flex w-full flex-col">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  className={`flex h-9 w-full items-center gap-2 rounded-xl px-3 py-2 text-left ${
                    item.active
                      ? "bg-[#F5F5F5] text-[#171717]"
                      : "text-[#0A0A0A] hover:bg-[#F5F5F5]"
                  }`}
                >
                  <Icon size={16} strokeWidth={2} />

                  <span className="text-sm font-medium leading-[100%]">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </aside>
  );
}