"use client";

import { useEffect, useRef, useState } from "react";
import {
  Calendar,
  Check,
  ChevronRight,
  Circle,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  Tag,
  Users,
} from "lucide-react";

type FilterCategory =
  | "Status"
  | "Priority"
  | "Members"
  | "Due Date"
  | "Teams"
  | "Labels"
  | "Reporter";

type Priority = "No Priority" | "Urgent" | "High" | "Medium" | "Low";

type Status = "To Do" | "Doing" | "Completed" | "On Hold";

type DueDate = "Increasing" | "Decreasing";

type FilterState = {
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
      icon: Circle,
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

export default function TaskFilter({ onChange }: TaskFilterProps) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] =
    useState<FilterCategory | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    status: [],
    priority: [],
    members: [],
    dueDate: null,
    teams: [],
    labels: [],
    reporter: [],
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setActiveCategory(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setActiveCategory(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const updateFilters = (nextFilters: FilterState) => {
    setFilters(nextFilters);
    onChange?.(nextFilters);
  };

  const togglePriority = (priority: Priority) => {
    const exists = filters.priority.includes(priority);

    const nextPriority = exists
      ? filters.priority.filter((item) => item !== priority)
      : [...filters.priority, priority];

    updateFilters({
      ...filters,
      priority: nextPriority,
    });
  };

  const toggleStatus = (status: Status) => {
    const exists = filters.status.includes(status);

    const nextStatus = exists
      ? filters.status.filter((item) => item !== status)
      : [...filters.status, status];

    updateFilters({
      ...filters,
      status: nextStatus,
    });
  };

  const selectDueDate = (value: DueDate) => {
    updateFilters({
      ...filters,
      dueDate: filters.dueDate === value ? null : value,
    });
  };

  const renderSubmenu = () => {
    if (activeCategory === "Priority") {
      return (
        <div className="absolute right-[calc(100%+8px)] top-[52px] w-48 min-w-48 rounded-md border border-[#E5E5E5] bg-white p-1.5 shadow-[0px_4px_6px_-2px_#00000014,0px_2px_4px_-1px_#0000000A]">
          <div className="flex h-9 items-center px-3">
            <span className="text-xs font-medium text-[#737373]">
              Priority
            </span>
          </div>

          {priorityOptions.map((option) => {
            const Icon = option.icon;
            const selected = filters.priority.includes(option.name);

            return (
              <button
                key={option.name}
                type="button"
                onClick={() => togglePriority(option.name)}
                className="flex h-9 w-full items-center gap-2 rounded-md px-3 text-left hover:bg-[#F5F5F5]"
              >
                <Icon
                  size={16}
                  strokeWidth={1.8}
                  style={{ color: option.color }}
                />

                <span
                  className="text-sm font-normal"
                  style={{ color: option.color }}
                >
                  {option.name}
                </span>

                <span className="ml-auto flex h-4 w-4 items-center justify-center">
                  {selected && (
                    <Check
                      size={16}
                      strokeWidth={2}
                      className="text-[#171717]"
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      );
    }

    if (activeCategory === "Status") {
      return (
        <div className="absolute right-[calc(100%+8px)] top-1 w-48 min-w-48 rounded-md border border-[#E5E5E5] bg-white p-1.5 shadow-[0px_4px_6px_-2px_#00000014,0px_2px_4px_-1px_#0000000A]">
          <div className="flex h-9 items-center px-3">
            <span className="text-xs font-medium text-[#737373]">
              Status
            </span>
          </div>

          {statusOptions.map((status) => {
            const selected = filters.status.includes(status);

            return (
              <button
                key={status}
                type="button"
                onClick={() => toggleStatus(status)}
                className="flex h-9 w-full items-center gap-2 rounded-md px-3 hover:bg-[#F5F5F5]"
              >
                <Circle
                  size={14}
                  strokeWidth={1.8}
                  className="text-[#171717]"
                />

                <span className="text-sm text-[#171717]">
                  {status}
                </span>

                <span className="ml-auto">
                  {selected && (
                    <Check
                      size={16}
                      strokeWidth={2}
                      className="text-[#171717]"
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      );
    }

    if (activeCategory === "Due Date") {
      return (
        <div className="absolute right-[calc(100%+8px)] top-[108px] w-48 min-w-48 rounded-md border border-[#E5E5E5] bg-white p-1.5 shadow-[0px_4px_6px_-2px_#00000014,0px_2px_4px_-1px_#0000000A]">
          <div className="flex h-9 items-center px-3">
            <span className="text-xs font-medium text-[#737373]">
              Due Date
            </span>
          </div>

          {dueDateOptions.map((option) => {
            const selected = filters.dueDate === option;

            return (
              <button
                key={option}
                type="button"
                onClick={() => selectDueDate(option)}
                className="flex h-9 w-full items-center gap-2 rounded-md px-3 hover:bg-[#F5F5F5]"
              >
                <Calendar
                  size={16}
                  strokeWidth={1.8}
                  className="text-[#171717]"
                />

                <span className="text-sm text-[#171717]">
                  {option}
                </span>

                <span className="ml-auto">
                  {selected && (
                    <Check
                      size={16}
                      strokeWidth={2}
                      className="text-[#171717]"
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      );
    }

    return null;
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          setActiveCategory(null);
        }}
        className={`flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E5E5] bg-white transition hover:bg-[#F5F5F5] ${open ? "bg-[#F5F5F5]" : ""
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
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-48 min-w-48 rounded-md border border-[#E5E5E5] bg-white p-1.5 shadow-[0px_8px_16px_-4px_#00000014,0px_4px_8px_-2px_#0000000A]">
          {categories.map((category) => {
            const Icon = category.icon;
            const selected =
              activeCategory === category.name;

            return (
              <button
                key={category.name}
                type="button"
                onClick={() => {
                  if (
                    category.name === "Priority" ||
                    category.name === "Status" ||
                    category.name === "Due Date"
                  ) {
                    setActiveCategory(
                      selected ? null : category.name,
                    );
                  }
                }}
                className={`flex h-9 w-full items-center gap-2.5 rounded-md px-3 ${selected
                    ? "bg-[#F5F5F5]"
                    : "hover:bg-[#F5F5F5]"
                  }`}
              >
                <Icon
                  size={18}
                  strokeWidth={1.8}
                  className="shrink-0 text-[#171717]"
                />

                <span className="text-sm font-normal text-[#171717]">
                  {category.name}
                </span>

                <ChevronRight
                  size={16}
                  strokeWidth={1.8}
                  className="ml-auto text-[#171717]"
                />
              </button>
            );
          })}
        </div>
      )}

      {open && activeCategory && renderSubmenu()}
    </div>
  );
}