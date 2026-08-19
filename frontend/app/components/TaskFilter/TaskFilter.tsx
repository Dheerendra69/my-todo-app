"use client";

import { useEffect, useRef, useState } from "react";
import {
  Calendar,
  Check,
  ChevronRight,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  Tag,
  Users,
} from "lucide-react";

export type FilterCategory =
  | "Status"
  | "Priority"
  | "Members"
  | "Due Date"
  | "Teams"
  | "Labels"
  | "Reporter";

export type Priority =
  | "No Priority"
  | "Urgent"
  | "High"
  | "Medium"
  | "Low";

export type Status =
  | "To Do"
  | "Doing"
  | "Completed"
  | "On Hold";

export type DueDate =
  | "Increasing"
  | "Decreasing";

export type FilterState = {
  status: Status[];
  priority: Priority[];
  members: string[];
  dueDate: DueDate | null;
  teams: string[];
  labels: string[];
  reporter: string[];
};

type TaskFilterProps = {
  onChange?: (filters: FilterState) => void;
};

const categories: {
  name: FilterCategory;
  icon: React.ElementType;
}[] = [
    {
      name: "Status",
      icon: Signal,
    },
    {
      name: "Priority",
      icon: Signal,
    },
    {
      name: "Members",
      icon: Users,
    },
    {
      name: "Due Date",
      icon: Calendar,
    },
    {
      name: "Teams",
      icon: Users,
    },
    {
      name: "Labels",
      icon: Tag,
    },
    {
      name: "Reporter",
      icon: Users,
    },
  ];

const priorityOptions: {
  name: Priority;
  color: string;
  icon: React.ElementType;
}[] = [
    {
      name: "No Priority",
      color: "#171717",
      icon: Signal,
    },
    {
      name: "Urgent",
      color: "#EF4444",
      icon: Signal,
    },
    {
      name: "High",
      color: "#F97316",
      icon: SignalHigh,
    },
    {
      name: "Medium",
      color: "#EAB308",
      icon: SignalMedium,
    },
    {
      name: "Low",
      color: "#9CA3AF",
      icon: SignalLow,
    },
  ];

const statusOptions: Status[] = [
  "To Do",
  "Doing",
  "Completed",
  "On Hold",
];

const dueDateOptions: DueDate[] = [
  "Increasing",
  "Decreasing",
];

export default function TaskFilter({
  onChange,
}: TaskFilterProps) {
  const [open, setOpen] = useState(false);

  const [
    activeCategory,
    setActiveCategory,
  ] = useState<FilterCategory | null>(
    null,
  );

  const [filters, setFilters] =
    useState<FilterState>({
      status: [],
      priority: [],
      members: [],
      dueDate: null,
      teams: [],
      labels: [],
      reporter: [],
    });

  const containerRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent,
    ) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
        setActiveCategory(null);
      }
    };

    const handleEscape = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        setOpen(false);
        setActiveCategory(null);
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
  }, []);

  const updateFilters = (
    nextFilters: FilterState,
  ) => {
    setFilters(nextFilters);
    onChange?.(nextFilters);
  };

  const togglePriority = (
    priority: Priority,
  ) => {
    const exists =
      filters.priority.includes(priority);

    const nextPriority = exists
      ? filters.priority.filter(
        (item) => item !== priority,
      )
      : [
        ...filters.priority,
        priority,
      ];

    updateFilters({
      ...filters,
      priority: nextPriority,
    });
  };

  const toggleStatus = (
    status: Status,
  ) => {
    const exists =
      filters.status.includes(status);

    const nextStatus = exists
      ? filters.status.filter(
        (item) => item !== status,
      )
      : [
        ...filters.status,
        status,
      ];

    updateFilters({
      ...filters,
      status: nextStatus,
    });
  };

  const selectDueDate = (
    value: DueDate,
  ) => {
    updateFilters({
      ...filters,
      dueDate:
        filters.dueDate === value
          ? null
          : value,
    });
  };

  const hasActiveFilters =
    filters.status.length > 0 ||
    filters.priority.length > 0 ||
    filters.members.length > 0 ||
    filters.dueDate !== null ||
    filters.teams.length > 0 ||
    filters.labels.length > 0 ||
    filters.reporter.length > 0;

  const renderSubmenu = () => {
    if (activeCategory === "Priority") {
      return (
        <div className="absolute left-0 top-[calc(100%+8px)] z-[70] w-48 min-w-48 rounded-md border border-[var(--border)] bg-[var(--background)] p-1.5 shadow-[0px_8px_16px_-4px_#00000014,0px_4px_8px_-2px_#0000000A] md:left-auto md:right-[calc(100%+10px)] md:top-0">
          <div className="flex h-9 items-center px-3">
            <span className="text-xs font-medium text-[var(--foreground-secondary)]">
              Priority
            </span>
          </div>

          {priorityOptions.map(
            (option) => {
              const Icon = option.icon;

              const selected =
                filters.priority.includes(
                  option.name,
                );

              return (
                <button
                  key={option.name}
                  type="button"
                  onClick={() =>
                    togglePriority(
                      option.name,
                    )
                  }
                  className="flex h-9 w-full items-center gap-2 rounded-md px-3 text-left hover:bg-[var(--surface-secondary)]"
                >
                  <Icon
                    size={16}
                    strokeWidth={1.8}
                    style={{
                      color: option.color,
                    }}
                  />

                  <span
                    className="text-sm font-normal"
                    style={{
                      color: option.color,
                    }}
                  >
                    {option.name}
                  </span>

                  <span className="ml-auto flex h-4 w-4 items-center justify-center">
                    {selected && (
                      <Check
                        size={16}
                        strokeWidth={2}
                        className="text-[var(--foreground)]"
                      />
                    )}
                  </span>
                </button>
              );
            },
          )}
        </div>
      );
    }

    if (activeCategory === "Status") {
      return (
        <div className="absolute left-0 top-[calc(100%+8px)] z-[70] w-48 min-w-48 rounded-md border border-[var(--border)] bg-[var(--background)] p-1.5 shadow-[0px_8px_16px_-4px_#00000014,0px_4px_8px_-2px_#0000000A] md:left-auto md:right-[calc(100%+10px)] md:top-0">
          <div className="flex h-9 items-center px-3">
            <span className="text-xs font-medium text-[var(--foreground-secondary)]">
              Status
            </span>
          </div>

          {statusOptions.map(
            (status) => {
              const selected =
                filters.status.includes(
                  status,
                );

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() =>
                    toggleStatus(status)
                  }
                  className="flex h-9 w-full items-center gap-2 rounded-md px-3 hover:bg-[var(--surface-secondary)]"
                >
                  <span className="flex h-4 w-4 items-center justify-center">
                    {selected && (
                      <Check
                        size={16}
                        strokeWidth={2}
                        className="text-[var(--foreground)]"
                      />
                    )}
                  </span>

                  <span className="text-sm text-[var(--foreground)]">
                    {status}
                  </span>
                </button>
              );
            },
          )}
        </div>
      );
    }

    if (activeCategory === "Due Date") {
      return (
        <div className="absolute left-0 top-[calc(100%+8px)] z-[70] w-48 min-w-48 rounded-md border border-[var(--border)] bg-[var(--background)] p-1.5 shadow-[0px_8px_16px_-4px_#00000014,0px_4px_8px_-2px_#0000000A] md:left-auto md:right-[calc(100%+10px)] md:top-0">
          <div className="flex h-9 items-center px-3">
            <span className="text-xs font-medium text-[var(--foreground-secondary)]">
              Due Date
            </span>
          </div>

          {dueDateOptions.map(
            (option) => {
              const selected =
                filters.dueDate === option;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    selectDueDate(option)
                  }
                  className="flex h-9 w-full items-center gap-2 rounded-md px-3 hover:bg-[var(--surface-secondary)]"
                >
                  <Calendar
                    size={16}
                    strokeWidth={1.8}
                    className="text-[var(--foreground)]"
                  />

                  <span className="text-sm text-[var(--foreground)]">
                    {option}
                  </span>

                  <span className="ml-auto">
                    {selected && (
                      <Check
                        size={16}
                        strokeWidth={2}
                        className="text-[var(--foreground)]"
                      />
                    )}
                  </span>
                </button>
              );
            },
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          setActiveCategory(null);
        }}
        className={`relative flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] transition hover:bg-[var(--surface-secondary)] ${open
          ? "bg-[var(--surface-secondary)]"
          : ""
          }`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3Z" />
        </svg>

        {hasActiveFilters && (
          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[var(--background)]" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50">
          <div
            className="relative w-48 min-w-48 rounded-md border border-[var(--border)] bg-[var(--background)] p-1.5 shadow-[0px_8px_16px_-4px_#00000014,0px_4px_8px_-2px_#0000000A]"
            onClick={() => {
              setActiveCategory(null);
            }}
          >
            {categories.map(
              (category) => {
                const Icon =
                  category.icon;

                const selected =
                  activeCategory ===
                  category.name;

                const hasSubmenu =
                  category.name ===
                  "Priority" ||
                  category.name ===
                  "Status" ||
                  category.name ===
                  "Due Date";

                return (
                  <button
                    key={category.name}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();

                      if (hasSubmenu) {
                        setActiveCategory(
                          selected
                            ? null
                            : category.name,
                        );
                      }
                    }}
                    className={`flex h-9 w-full items-center gap-2.5 rounded-md px-3 ${selected
                      ? "bg-[var(--surface-secondary)]"
                      : "hover:bg-[var(--surface-secondary)]"
                      }`}
                  >
                    <Icon
                      size={18}
                      strokeWidth={1.8}
                      className="shrink-0 text-[var(--foreground)]"
                    />

                    <span className="text-sm font-normal text-[var(--foreground)]">
                      {category.name}
                    </span>

                    {hasSubmenu && (
                      <ChevronRight
                        size={16}
                        strokeWidth={1.8}
                        className="ml-auto text-[var(--foreground)]"
                      />
                    )}
                  </button>
                );
              },
            )}
          </div>

          {activeCategory &&
            renderSubmenu()}
        </div>
      )}
    </div>
  );
}