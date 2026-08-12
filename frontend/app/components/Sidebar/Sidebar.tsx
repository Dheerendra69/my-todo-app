"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronsUpDown,
  ChevronDown,
  ChevronRight,
  Check,
  Sun,
  Moon,
  Settings,
  CheckSquare,
  BriefcaseBusiness,
} from "lucide-react";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

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

const colorModes = [
  { name: "Amber", color: "#D97706" },
  { name: "Blue", color: "#9333EA" },
  { name: "Pink", color: "#DB2777" },
  { name: "Rose", color: "#E11D48" },
  { name: "Emerald", color: "#059669" },
  { name: "Black", color: "#171717" },
];

export default function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<
    "theme" | "color" | null
  >(null);

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [colorMode, setColorMode] = useState("Blue");

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsProfileOpen(false);
      setActiveMenu(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
        setActiveMenu(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
        setActiveMenu(null);
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleProfileClick = () => {
    setIsProfileOpen((prev) => !prev);
    setActiveMenu(null);
  };

  const handleThemeClick = () => {
    setActiveMenu((prev) =>
      prev === "theme" ? null : "theme"
    );
  };

  const handleColorClick = () => {
    setActiveMenu((prev) =>
      prev === "color" ? null : "color"
    );
  };

  const handleThemeSelect = (value: "light" | "dark") => {
    setTheme(value);
    setActiveMenu(null);
  };

  const handleColorSelect = (value: string) => {
    setColorMode(value);
    setActiveMenu(null);
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen w-64 border-r border-[#E5E5E5] bg-[#FAFAFA] transition-transform duration-200 ${isOpen
        ? "translate-x-0"
        : "-translate-x-full"
        }`}
    >
      <div
        ref={profileRef}
        className="relative h-full w-full"
      >
        <div className="flex h-16 w-full items-center p-2">
          <button
            onClick={handleProfileClick}
            className="flex h-12 w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors hover:bg-[#F5F5F5]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F5F5F5]">
              <img
                src="/Dexter.jpeg"
                alt="Dexter"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex min-w-0 flex-1 items-center">
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

        {isProfileOpen && (
          <div className="absolute left-4 top-[107px] z-50 w-[240px] max-w-[calc(100vw-32px)] rounded-md border border-[#0A0A0A0D] bg-white p-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.12),0_2px_4px_rgba(0,0,0,0.08)]">
            <div className="flex h-[120px] w-full flex-col items-center justify-center gap-4 px-3">
              <div className="h-10 w-10 overflow-hidden rounded-full bg-[#F5F5F5]">
                <img
                  src="/Dexter.jpeg"
                  alt="Dexter"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex w-full min-w-0 flex-col items-center">
                <span className="max-w-[109px] truncate text-sm font-normal leading-4 text-[#171717]">
                  Dexter
                </span>

                <span className="max-w-[109px] truncate text-xs font-medium leading-4 text-[#6B7280]">
                  Dexter@gmail.com
                </span>
              </div>
            </div>

            <div className="h-px w-full bg-[#0A0A0A0D]" />

            <div className="relative mt-1 flex flex-col gap-1">
              <button
                onClick={handleThemeClick}
                className="flex h-9 w-full items-center gap-2 rounded-2xl px-3 py-2 transition-colors hover:bg-[#F5F5F5]"
              >
                <Sun
                  size={16}
                  strokeWidth={2}
                  className="shrink-0 text-[#171717]"
                />

                <span className="min-w-0 flex-1 truncate text-left text-sm font-normal leading-5 text-[#171717]">
                  Change Theme
                </span>

                <ChevronRight
                  size={16}
                  strokeWidth={2}
                  className="shrink-0 text-[#171717]"
                />
              </button>

              <button
                onClick={handleColorClick}
                className="flex h-9 w-full items-center gap-2 rounded-2xl px-3 py-2 transition-colors hover:bg-[#F5F5F5]"
              >
                <div
                  className="h-4 w-4 shrink-0 rounded-xs"
                  style={{
                    backgroundColor:
                      colorModes.find(
                        (item) => item.name === colorMode
                      )?.color || "#9333EA",
                  }}
                />

                <span className="min-w-0 flex-1 truncate text-left text-sm font-normal leading-5 text-[#171717]">
                  Color Mode
                </span>

                <ChevronRight
                  size={16}
                  strokeWidth={2}
                  className="shrink-0 text-[#171717]"
                />
              </button>

              <button className="flex h-9 w-full items-center gap-2 rounded-2xl px-3 py-2 transition-colors hover:bg-[#F5F5F5]">
                <Settings
                  size={16}
                  strokeWidth={2}
                  className="shrink-0 text-[#171717]"
                />

                <span className="min-w-0 flex-1 truncate text-left text-sm font-normal leading-5 text-[#171717]">
                  Settings
                </span>
              </button>
            </div>

            {activeMenu === "theme" && (
              <div className="absolute left-[calc(100%+14px)] top-[211px] z-[60] w-[192px] max-w-[calc(100vw-24px)] rounded-md border border-[#0A0A0A0D] bg-white p-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.12),0_2px_4px_rgba(0,0,0,0.08)]">
                <div className="flex h-9 items-center px-3 py-2">
                  <span className="text-sm font-medium leading-5 text-[#737373]">
                    Theme
                  </span>
                </div>

                <button
                  onClick={() =>
                    handleThemeSelect("light")
                  }
                  className="flex h-9 w-full items-center gap-2 rounded-2xl px-3 py-2 hover:bg-[#F5F5F5]"
                >
                  <Sun
                    size={16}
                    strokeWidth={2}
                    className="shrink-0 text-[#171717]"
                  />

                  <span className="min-w-0 flex-1 truncate text-left text-sm font-normal leading-5 text-[#171717]">
                    Light
                  </span>

                  {theme === "light" && (
                    <Check
                      size={16}
                      strokeWidth={2}
                      className="shrink-0 text-[#171717]"
                    />
                  )}
                </button>

                <button
                  onClick={() =>
                    handleThemeSelect("dark")
                  }
                  className="flex h-9 w-full items-center gap-2 rounded-2xl px-3 py-2 hover:bg-[#F5F5F5]"
                >
                  <Moon
                    size={16}
                    strokeWidth={2}
                    className="shrink-0 text-[#171717]"
                  />

                  <span className="min-w-0 flex-1 truncate text-left text-sm font-normal leading-5 text-[#171717]">
                    Dark
                  </span>

                  {theme === "dark" && (
                    <Check
                      size={16}
                      strokeWidth={2}
                      className="shrink-0 text-[#171717]"
                    />
                  )}
                </button>
              </div>
            )}

            {activeMenu === "color" && (
              <div className="absolute left-[calc(100%+14px)] top-[247px] z-[60] w-[192px] max-w-[calc(100vw-24px)] rounded-md border border-[#0A0A0A0D] bg-white p-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.12),0_2px_4px_rgba(0,0,0,0.08)]">
                <div className="flex h-9 items-center px-3 py-2">
                  <span className="text-sm font-medium leading-5 text-[#737373]">
                    Color Mode
                  </span>
                </div>

                {colorModes.map((item) => (
                  <button
                    key={item.name}
                    onClick={() =>
                      handleColorSelect(item.name)
                    }
                    className="flex h-9 w-full items-center gap-2 rounded-2xl px-3 py-2 hover:bg-[#F5F5F5]"
                  >
                    <span
                      className="h-4 w-4 shrink-0 rounded-xs"
                      style={{
                        backgroundColor: item.color,
                      }}
                    />

                    <span className="min-w-0 flex-1 truncate text-left text-sm font-normal leading-5 text-[#171717]">
                      {item.name}
                    </span>

                    {colorMode === item.name && (
                      <Check
                        size={16}
                        strokeWidth={2}
                        className="shrink-0 text-[#171717]"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="w-full p-2">
          <button
            onClick={() =>
              setIsWorkspaceOpen((prev) => !prev)
            }
            className="flex h-8 w-full items-center justify-between rounded-xl px-3 text-left hover:bg-[#F5F5F5]"
          >
            <span className="text-sm font-medium leading-5 text-[#0A0A0A]">
              Workspace
            </span>

            <ChevronDown
              size={16}
              strokeWidth={2}
              className={`text-[#171717] transition-transform ${isWorkspaceOpen ? "" : "rotate-180"
                }`}
            />
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
                    className={`flex h-9 w-full items-center gap-2 rounded-xl px-3 py-2 text-left ${item.active
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
      </div>
    </aside>
  );
}