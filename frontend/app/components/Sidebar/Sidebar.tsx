"use client";

import { useEffect, useRef, useState } from "react";

import {
  ArrowLeft,
  ChevronsUpDown,
  ChevronDown,
  ChevronRight,
  Check,
  Search,
  Sun,
  Moon,
  Settings,
  CheckSquare,
  BriefcaseBusiness,
  User,
} from "lucide-react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  useAuth,
} from "../auth/AuthContext";

import {
  useTheme,
  ColorMode,
} from "../theme/ThemeContext";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const navigation = [
  {
    label: "Tasks",
    icon: CheckSquare,
    route: "/tasks",
  },
  {
    label: "Projects",
    icon: BriefcaseBusiness,
    route: "/projects",
  },
];

const colorModes = [
  {
    name: "Amber",
    color: "#D97706",
  },
  {
    name: "Blue",
    color: "#9333EA",
  },
  {
    name: "Pink",
    color: "#DB2777",
  },
  {
    name: "Rose",
    color: "#E11D48",
  },
  {
    name: "Emerald",
    color: "#059669",
  },
  {
    name: "Black",
    color: "#171717",
  },
];

export default function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
  const {
    user,
  } = useAuth();

  const [
    isWorkspaceOpen,
    setIsWorkspaceOpen,
  ] = useState(true);

  const [
    isProfileOpen,
    setIsProfileOpen,
  ] = useState(false);

  const [
    activeMenu,
    setActiveMenu,
  ] = useState<
    "theme" | "color" | null
  >(null);

  const {
    theme,
    colorMode,
    setTheme,
    setColorMode,
  } = useTheme();

  const router =
    useRouter();

  const pathname =
    usePathname();

  const isSettingsView =
    pathname.startsWith(
      "/settings",
    );

  const settingsItem =
    "profile";

  const profileRef =
    useRef<HTMLDivElement>(
      null,
    );

  useEffect(() => {
    if (!isOpen) {
      setIsProfileOpen(
        false,
      );

      setActiveMenu(
        null,
      );
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent,
    ) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target as Node,
        )
      ) {
        setIsProfileOpen(
          false,
        );

        setActiveMenu(
          null,
        );
      }
    };

    const handleEscape = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key ===
        "Escape"
      ) {
        setIsProfileOpen(
          false,
        );

        setActiveMenu(
          null,
        );

        onClose();
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );

      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [onClose]);

  const handleProfileClick =
    () => {
      setIsProfileOpen(
        (prev) => !prev,
      );

      setActiveMenu(
        null,
      );
    };

  const handleThemeClick =
    () => {
      setActiveMenu(
        (prev) =>
          prev === "theme"
            ? null
            : "theme",
      );
    };

  const handleColorClick =
    () => {
      setActiveMenu(
        (prev) =>
          prev === "color"
            ? null
            : "color",
      );
    };

  const openSettings =
    () => {
      setIsProfileOpen(
        false,
      );

      setActiveMenu(
        null,
      );

      router.push(
        "/settings/profile",
      );
    };

  const backToApp =
    () => {
      setActiveMenu(
        null,
      );

      router.push(
        "/tasks",
      );
    };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen w-64 border-r border-[var(--border)] bg-[var(--surface)] transition-transform duration-200 ${
        isOpen
          ? "translate-x-0"
          : "-translate-x-full"
      }`}
    >
      <div
        ref={profileRef}
        className="relative h-full w-full"
      >
        {isSettingsView ? (
          <>
            <div className="flex h-[52px] w-full items-center p-2">
              <button
                type="button"
                onClick={
                  backToApp
                }
                className="flex h-9 w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors hover:bg-[var(--surface-secondary)]"
              >
                <ArrowLeft
                  size={16}
                  strokeWidth={2}
                  className="shrink-0 text-[var(--foreground)]"
                />

                <span className="text-sm font-normal leading-[100%] text-[var(--foreground)]">
                  Back to app
                </span>
              </button>
            </div>

            <div className="flex w-full flex-col gap-2 p-2">
              <div className="flex h-8 w-full items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--background)] px-3">
                <Search
                  size={16}
                  strokeWidth={2}
                  className="shrink-0 text-[var(--foreground-secondary)]"
                />

                <input
                  type="text"
                  placeholder="Search"
                  className="min-w-0 flex-1 bg-transparent text-sm font-normal leading-5 text-[var(--foreground)] outline-none placeholder:text-[var(--foreground-secondary)]"
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/settings/profile",
                  )
                }
                className={`flex h-9 w-full items-center gap-2 rounded-md px-3 py-2 text-left transition-colors ${
                  settingsItem ===
                  "profile"
                    ? "bg-[var(--surface-secondary)]"
                    : "hover:bg-[var(--surface-secondary)]"
                }`}
              >
                <User
                  size={16}
                  strokeWidth={2}
                  className="shrink-0 text-[var(--foreground)]"
                />

                <span className="min-w-0 flex-1 truncate text-sm font-medium leading-[100%] text-[var(--foreground)]">
                  Profile
                </span>
              </button>

              <button
                type="button"
                onClick={
                  handleThemeClick
                }
                className="flex h-9 w-full items-center gap-2 rounded-md px-3 py-2 text-left transition-colors hover:bg-[var(--surface-secondary)]"
              >
                <Sun
                  size={16}
                  strokeWidth={2}
                  className="shrink-0 text-[var(--foreground)]"
                />

                <span className="min-w-0 flex-1 truncate text-sm font-normal leading-[100%] text-[var(--foreground)]">
                  Theme
                </span>
              </button>

              <button
                type="button"
                onClick={
                  handleColorClick
                }
                className="flex h-9 w-full items-center gap-2 rounded-md px-3 py-2 text-left transition-colors hover:bg-[var(--surface-secondary)]"
              >
                <div
                  className="h-4 w-4 shrink-0 rounded-xs"
                  style={{
                    backgroundColor:
                      colorModes.find(
                        (item) =>
                          item.name ===
                          colorMode,
                      )?.color ||
                      "#171717",
                  }}
                />

                <span className="min-w-0 flex-1 truncate text-sm font-normal leading-[100%] text-[var(--foreground)]">
                  Color
                </span>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex h-16 w-full items-center p-2">
              <button
                type="button"
                onClick={
                  handleProfileClick
                }
                className="flex h-12 w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors hover:bg-[var(--surface-secondary)]"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-secondary)]">
                  <img
                    src={
                      user?.avatar ||
                      "/default-avatar.jpeg"
                    }
                    alt={
                      user?.name ||
                      "User"
                    }
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex min-w-0 flex-1 items-center">
                  <span className="truncate text-sm font-medium leading-5 text-[var(--foreground)]">
                    {user?.name ||
                      "User"}
                  </span>
                </div>

                <ChevronsUpDown
                  size={16}
                  strokeWidth={2}
                  className="shrink-0 text-[var(--foreground)]"
                />
              </button>
            </div>

            {isProfileOpen && (
              <div className="absolute left-4 top-[107px] z-50 w-[240px] max-w-[calc(100vw-32px)] rounded-md border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.12),0_2px_4px_rgba(0,0,0,0.08)]">
                <div className="flex h-[120px] w-full flex-col items-center justify-center gap-4 px-3">
                  <div className="h-10 w-10 overflow-hidden rounded-full bg-[var(--surface-secondary)]">
                    <img
                      src={
                        user?.avatar ||
                        "/default-avatar.jpeg"
                      }
                      alt={
                        user?.name ||
                        "User"
                      }
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex w-full min-w-0 flex-col items-center">
                    <span className="max-w-[109px] truncate text-sm font-normal leading-4 text-[var(--foreground)]">
                      {user?.name ||
                        "User"}
                    </span>

                    <span className="max-w-[109px] truncate text-xs font-medium leading-4 text-[var(--foreground-secondary)]">
                      {user?.email ||
                        "Guest account"}
                    </span>
                  </div>
                </div>

                <div className="h-px w-full bg-[var(--border)]" />

                <div className="relative mt-1 flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={
                      handleThemeClick
                    }
                    className="flex h-9 w-full items-center gap-2 rounded-2xl px-3 py-2 transition-colors hover:bg-[var(--surface-secondary)]"
                  >
                    <Sun
                      size={16}
                      strokeWidth={2}
                      className="shrink-0 text-[var(--foreground)]"
                    />

                    <span className="min-w-0 flex-1 truncate text-left text-sm font-normal leading-5 text-[var(--foreground)]">
                      Change Theme
                    </span>

                    <ChevronRight
                      size={16}
                      strokeWidth={2}
                      className="shrink-0 text-[var(--foreground)]"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleColorClick
                    }
                    className="flex h-9 w-full items-center gap-2 rounded-2xl px-3 py-2 transition-colors hover:bg-[var(--surface-secondary)]"
                  >
                    <div
                      className="h-4 w-4 shrink-0 rounded-xs"
                      style={{
                        backgroundColor:
                          colorModes.find(
                            (item) =>
                              item.name ===
                              colorMode,
                          )?.color ||
                          "#9333EA",
                      }}
                    />

                    <span className="min-w-0 flex-1 truncate text-left text-sm font-normal leading-5 text-[var(--foreground)]">
                      Color Mode
                    </span>

                    <ChevronRight
                      size={16}
                      strokeWidth={2}
                      className="shrink-0 text-[var(--foreground)]"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={
                      openSettings
                    }
                    className="flex h-9 w-full items-center gap-2 rounded-2xl px-3 py-2 transition-colors hover:bg-[var(--surface-secondary)]"
                  >
                    <Settings
                      size={16}
                      strokeWidth={2}
                      className="shrink-0 text-[var(--foreground)]"
                    />

                    <span className="min-w-0 flex-1 truncate text-left text-sm font-normal leading-5 text-[var(--foreground)]">
                      Settings
                    </span>
                  </button>
                </div>
              </div>
            )}

            <div className="w-full p-2">
              <button
                type="button"
                onClick={() =>
                  setIsWorkspaceOpen(
                    (prev) => !prev,
                  )
                }
                className="flex h-8 w-full items-center justify-between rounded-xl px-3 text-left hover:bg-[var(--surface-secondary)]"
              >
                <span className="text-sm font-medium leading-5 text-[var(--foreground)]">
                  Workspace
                </span>

                <ChevronDown
                  size={16}
                  strokeWidth={2}
                  className={`text-[var(--foreground)] transition-transform ${
                    isWorkspaceOpen
                      ? ""
                      : "rotate-180"
                  }`}
                />
              </button>
            </div>

            {isWorkspaceOpen && (
              <nav className="w-full px-2">
                <div className="flex w-full flex-col">
                  {navigation.map(
                    (item) => {
                      const Icon =
                        item.icon;

                      const isActive =
                        pathname ===
                          item.route ||
                        pathname.startsWith(
                          `${item.route}/`,
                        );

                      return (
                        <button
                          key={
                            item.label
                          }
                          type="button"
                          onClick={() => {
                            setIsProfileOpen(
                              false,
                            );

                            setActiveMenu(
                              null,
                            );

                            router.push(
                              item.route,
                            );
                          }}
                          className={`flex h-9 w-full items-center gap-2 rounded-xl px-3 py-2 text-left ${
                            isActive
                              ? "bg-[var(--surface-secondary)] text-[var(--foreground)]"
                              : "text-[var(--foreground)] hover:bg-[var(--surface-secondary)]"
                          }`}
                        >
                          <Icon
                            size={16}
                            strokeWidth={2}
                          />

                          <span className="text-sm font-medium leading-[100%]">
                            {
                              item.label
                            }
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>
              </nav>
            )}
          </>
        )}

        {activeMenu ===
          "theme" && (
          <div
            className={`absolute z-[60] w-[192px] rounded-md border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.12),0_2px_4px_rgba(0,0,0,0.08)] ${
              isSettingsView
                ? "left-[calc(100%-80px)] top-[150px] md:left-[calc(100%-80px)] md:top-[150px]"
                : "left-[calc(100%-60px)] top-[250px] md:left-[calc(100%+20px)] md:top-[250px]"
            }`}
          >
            <div className="flex h-9 items-center px-3 py-2">
              <span className="text-sm font-medium leading-5 text-[var(--foreground-secondary)]">
                Theme
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setTheme(
                  "light",
                );

                setActiveMenu(
                  null,
                );
              }}
              className="flex h-9 w-full items-center gap-2 rounded-2xl px-3 py-2 text-[var(--foreground)] hover:bg-[var(--surface-secondary)]"
            >
              <Sun
                size={16}
                strokeWidth={2}
              />

              <span className="min-w-0 flex-1 text-left text-sm">
                Light
              </span>

              {theme ===
                "light" && (
                <Check
                  size={16}
                  strokeWidth={2}
                />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setTheme(
                  "dark",
                );

                setActiveMenu(
                  null,
                );
              }}
              className="flex h-9 w-full items-center gap-2 rounded-2xl px-3 py-2 text-[var(--foreground)] hover:bg-[var(--surface-secondary)]"
            >
              <Moon
                size={16}
                strokeWidth={2}
              />

              <span className="min-w-0 flex-1 text-left text-sm">
                Dark
              </span>

              {theme ===
                "dark" && (
                <Check
                  size={16}
                  strokeWidth={2}
                />
              )}
            </button>
          </div>
        )}

        {activeMenu ===
          "color" && (
          <div
            className={`absolute z-[60] w-[192px] rounded-md border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.12),0_2px_4px_rgba(0,0,0,0.08)] ${
              isSettingsView
                ? "left-[calc(100%-80px)] top-[200px] md:left-[calc(100%-80px)] md:top-[200px]"
                : "left-[calc(100%-60px)] top-[300px] md:left-[calc(100%+20px)] md:top-[300px]"
            }`}
          >
            <div className="flex h-9 items-center px-3 py-2">
              <span className="text-sm font-medium leading-5 text-[var(--foreground-secondary)]">
                Color Mode
              </span>
            </div>

            {colorModes.map(
              (item) => (
                <button
                  key={
                    item.name
                  }
                  type="button"
                  onClick={() => {
                    setColorMode(
                      item.name as ColorMode,
                    );

                    setActiveMenu(
                      null,
                    );
                  }}
                  className="flex h-9 w-full items-center gap-2 rounded-2xl px-3 py-2 text-[var(--foreground)] hover:bg-[var(--surface-secondary)]"
                >
                  <span
                    className="h-4 w-4 shrink-0 rounded-xs"
                    style={{
                      backgroundColor:
                        item.color,
                    }}
                  />

                  <span className="min-w-0 flex-1 truncate text-left text-sm font-normal">
                    {
                      item.name
                    }
                  </span>

                  {colorMode ===
                    item.name && (
                    <Check
                      size={16}
                      strokeWidth={2}
                    />
                  )}
                </button>
              ),
            )}
          </div>
        )}
      </div>
    </aside>
  );
}