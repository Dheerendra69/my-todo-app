"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";

import {
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Columns3,
  MoreHorizontal,
  Plus,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
} from "lucide-react";

import BoardActions from "../BoardActions/BoardActions";
import AddTaskModal from "../AddTaskModal/AddTaskModal";

import type { ViewMode } from "../FieldsPopover/FieldsPopOver";

import {
  type FilterState,
} from "../TaskFilter/TaskFilter";

import { useAuth } from "../auth/AuthContext";

import {
  useRouter,
} from "next/navigation";

type Priority =
  | "No Priority"
  | "Urgent"
  | "High"
  | "Medium"
  | "Low";

type TaskStatus =
  | "todo"
  | "doing"
  | "completed"
  | "on_hold";

type Task = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  member: string;
  avatar?: string;
  dueDate: string;
  dueDateValue: string | null;
  status: TaskStatus;
};

type TaskSection = {
  id: TaskStatus;
  title: string;
  tasks: Task[];
};

type BackendTask = {
  id: string;
  title: string;
  description: string | null;
  priority:
  | "no_priority"
  | "urgent"
  | "high"
  | "medium"
  | "low";
  dueDate: string | null;
  status: TaskStatus;
  project: {
    id: string;
    name: string;
  };
  assignee: {
    id: string;
    name: string;
    avatar?: string | null;
  } | null;
};

type BackendProject = {
  id: string;
  name: string;
};

type PendingChanges = Record<
  string,
  {
    priority: Priority;
    status: TaskStatus;
    dueDate: string | null;
  }
>;

const initialSections: TaskSection[] = [
  {
    id: "todo",
    title: "To Do",
    tasks: [],
  },
  {
    id: "doing",
    title: "Doing",
    tasks: [],
  },
  {
    id: "completed",
    title: "Completed",
    tasks: [],
  },
  {
    id: "on_hold",
    title: "On Hold",
    tasks: [],
  },
];

const initialFilters: FilterState = {
  status: [],
  priority: [],
  members: [],
  dueDate: null,
  teams: [],
  labels: [],
  reporter: [],
};

const priorityLabels: Record<
  BackendTask["priority"],
  Priority
> = {
  no_priority: "No Priority",
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const priorityToBackend: Record<
  Priority,
  BackendTask["priority"]
> = {
  "No Priority": "no_priority",
  Urgent: "urgent",
  High: "high",
  Medium: "medium",
  Low: "low",
};

const statusLabels: Record<
  TaskStatus,
  FilterState["status"][number]
> = {
  todo: "To Do",
  doing: "Doing",
  completed: "Completed",
  on_hold: "On Hold",
};

const statusOptions: {
  value: TaskStatus;
  label: string;
}[] = [
    {
      value: "todo",
      label: "To Do",
    },
    {
      value: "doing",
      label: "Doing",
    },
    {
      value: "completed",
      label: "Completed",
    },
    {
      value: "on_hold",
      label: "On Hold",
    },
  ];

const priorityOptions: Priority[] = [
  "No Priority",
  "Urgent",
  "High",
  "Medium",
  "Low",
];

function formatDueDate(
  dueDate: string | null,
) {
  if (!dueDate) {
    return "";
  }

  return new Date(
    dueDate,
  ).toLocaleDateString(
    "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
}

function formatTask(
  task: BackendTask,
): Task {
  return {
    id: task.id,
    title: task.title,
    description:
      task.description ?? "",
    priority:
      priorityLabels[
      task.priority
      ],
    member:
      task.assignee?.name ??
      "Unassigned",
    avatar:
      task.assignee?.avatar ??
      undefined,
    dueDate:
      formatDueDate(
        task.dueDate,
      ),
    dueDateValue:
      task.dueDate,
    status:
      task.status,
  };
}

function PriorityBadge({
  priority,
}: {
  priority: Priority;
}) {
  const priorityConfig: Record<
    Priority,
    {
      icon: React.ElementType;
      className: string;
    }
  > = {
    "No Priority": {
      icon: Signal,
      className:
        "text-[var(--foreground-secondary)]",
    },
    Urgent: {
      icon: SignalHigh,
      className:
        "text-red-600 dark:text-red-400",
    },
    High: {
      icon: SignalHigh,
      className:
        "text-orange-500 dark:text-orange-400",
    },
    Medium: {
      icon: SignalMedium,
      className:
        "text-[var(--primary)]",
    },
    Low: {
      icon: SignalLow,
      className:
        "text-[var(--primary)] opacity-70",
    },
  };

  const config =
    priorityConfig[priority];

  const Icon =
    config.icon;

  return (
    <div
      className={`flex items-center gap-1 ${config.className}`}
    >
      <Icon
        size={12}
        strokeWidth={2}
      />

      <span className="text-xs font-medium">
        {priority}
      </span>
    </div>
  );
}

function MemberAvatar({
  member,
  avatar,
}: {
  member: string;
  avatar?: string;
}) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={member}
        className="h-5 w-5 rounded-full object-cover ring-1 ring-[var(--border)]"
      />
    );
  }

  return (
    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary-muted)] text-[10px] font-medium text-[var(--primary)]">
      {member === "Unassigned"
        ? "?"
        : member.charAt(0)}
    </div>
  );
}

function TaskActionMenu({
  task,
  anchorRef,
  onClose,
  onChange,
}: {
  task: Task;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onChange: (
    taskId: string,
    changes: {
      priority?: Priority;
      status?: TaskStatus;
      dueDate?: string | null;
    },
  ) => void;
}) {
  const [
    activeCategory,
    setActiveCategory,
  ] = useState<
    "Status" | "Priority" | "Due Date" | null
  >(null);

  const [
    priority,
    setPriority,
  ] = useState<Priority>(
    task.priority,
  );

  const [
    status,
    setStatus,
  ] = useState<TaskStatus>(
    task.status,
  );

  const [
    dueDate,
    setDueDate,
  ] = useState(
    task.dueDateValue ?? "",
  );

  const [
    position,
    setPosition,
  ] = useState({
    top: 0,
    left: 0,
  });

  const menuRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPriority(
      task.priority,
    );

    setStatus(
      task.status,
    );

    setDueDate(
      task.dueDateValue ?? "",
    );
  }, [
    task.priority,
    task.status,
    task.dueDateValue,
  ]);

  useLayoutEffect(() => {
    const updatePosition = () => {
      if (!anchorRef.current) {
        return;
      }

      const rect =
        anchorRef.current.getBoundingClientRect();

      setPosition({
        top: rect.top,
        left:
          rect.right - 192,
      });
    };

    updatePosition();

    window.addEventListener(
      "resize",
      updatePosition,
    );

    window.addEventListener(
      "scroll",
      updatePosition,
      true,
    );

    return () => {
      window.removeEventListener(
        "resize",
        updatePosition,
      );

      window.removeEventListener(
        "scroll",
        updatePosition,
        true,
      );
    };
  }, [anchorRef]);

  useEffect(() => {
    const handleOutsideClick = (
      event: MouseEvent,
    ) => {
      const target =
        event.target as Node;

      if (
        menuRef.current?.contains(
          target,
        )
      ) {
        return;
      }

      if (
        anchorRef.current?.contains(
          target,
        )
      ) {
        return;
      }

      onClose();
    };

    const handleEscape = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );

      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [
    onClose,
    anchorRef,
  ]);

  const updateTask = (
    changes: {
      priority?: Priority;
      status?: TaskStatus;
      dueDate?: string | null;
    },
  ) => {
    const updatedPriority =
      changes.priority ??
      priority;

    const updatedStatus =
      changes.status ??
      status;

    const updatedDueDate =
      changes.dueDate !== undefined
        ? changes.dueDate
        : dueDate || null;

    setPriority(
      updatedPriority,
    );

    setStatus(
      updatedStatus,
    );

    setDueDate(
      updatedDueDate ?? "",
    );

    onChange(
      task.id,
      {
        priority:
          updatedPriority,
        status:
          updatedStatus,
        dueDate:
          updatedDueDate,
      },
    );

    onClose();
  };

  if (
    typeof document ===
    "undefined"
  ) {
    return null;
  }

  return createPortal(
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
      }}
      className="z-[9999] flex gap-2"
    >
      <div className="relative w-48 min-w-48 rounded-md border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-xl">
        <button
          type="button"
          onClick={() =>
            setActiveCategory(
              activeCategory ===
                "Status"
                ? null
                : "Status",
            )
          }
          className={`flex h-9 w-full items-center gap-2.5 rounded-md px-3 text-[var(--foreground)] ${activeCategory ===
            "Status"
            ? "bg-[var(--surface-secondary)]"
            : "hover:bg-[var(--surface-secondary)]"
            }`}
        >
          <Signal
            size={18}
            strokeWidth={1.8}
          />

          <span className="text-sm">
            Status
          </span>

          <ChevronRight
            size={16}
            className="ml-auto"
          />
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveCategory(
              activeCategory ===
                "Priority"
                ? null
                : "Priority",
            )
          }
          className={`flex h-9 w-full items-center gap-2.5 rounded-md px-3 text-[var(--foreground)] ${activeCategory ===
            "Priority"
            ? "bg-[var(--surface-secondary)]"
            : "hover:bg-[var(--surface-secondary)]"
            }`}
        >
          <SignalHigh
            size={18}
            strokeWidth={1.8}
          />

          <span className="text-sm">
            Priority
          </span>

          <ChevronRight
            size={16}
            className="ml-auto"
          />
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveCategory(
              activeCategory ===
                "Due Date"
                ? null
                : "Due Date",
            )
          }
          className={`flex h-9 w-full items-center gap-2.5 rounded-md px-3 text-[var(--foreground)] ${activeCategory ===
            "Due Date"
            ? "bg-[var(--surface-secondary)]"
            : "hover:bg-[var(--surface-secondary)]"
            }`}
        >
          <Calendar
            size={18}
            strokeWidth={1.8}
          />

          <span className="text-sm">
            Due Date
          </span>

          <ChevronRight
            size={16}
            className="ml-auto"
          />
        </button>
      </div>

      {activeCategory ===
        "Status" && (
          <div className="absolute right-[calc(100%+10px)] top-0 w-48 rounded-md border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-xl">
            <div className="flex h-9 items-center px-3">
              <span className="text-xs font-medium text-[var(--foreground-secondary)]">
                Status
              </span>
            </div>

            {statusOptions.map(
              (option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    updateTask({
                      status:
                        option.value,
                    })
                  }
                  className="flex h-9 w-full items-center gap-2 rounded-md px-3 text-left hover:bg-[var(--surface-secondary)]"
                >
                  <span className="flex h-4 w-4 items-center justify-center">
                    {status ===
                      option.value && (
                        <Check
                          size={16}
                        />
                      )}
                  </span>

                  <span className="text-sm text-[var(--foreground)]">
                    {option.label}
                  </span>
                </button>
              ),
            )}
          </div>
        )}

      {activeCategory ===
        "Priority" && (
          <div className="absolute right-[calc(100%+10px)] top-0 w-48 rounded-md border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-xl">
            <div className="flex h-9 items-center px-3">
              <span className="text-xs font-medium text-[var(--foreground-secondary)]">
                Priority
              </span>
            </div>

            {priorityOptions.map(
              (option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    updateTask({
                      priority:
                        option,
                    })
                  }
                  className="flex h-9 w-full items-center gap-2 rounded-md px-3 text-left hover:bg-[var(--surface-secondary)]"
                >
                  <span className="flex h-4 w-4 items-center justify-center">
                    {priority ===
                      option && (
                        <Check
                          size={16}
                        />
                      )}
                  </span>

                  <PriorityBadge
                    priority={
                      option
                    }
                  />
                </button>
              ),
            )}
          </div>
        )}

      {activeCategory ===
        "Due Date" && (
          <div className="absolute right-[calc(100%+10px)] top-0 w-56 rounded-md border border-[var(--border)] bg-[var(--surface)] p-2 shadow-xl">
            <div className="flex h-9 items-center px-2">
              <span className="text-xs font-medium text-[var(--foreground-secondary)]">
                Due Date
              </span>
            </div>

            <input
              type="date"
              value={dueDate}
              onChange={(event) =>
                setDueDate(
                  event.target.value,
                )
              }
              className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm text-[var(--foreground)] outline-none"
            />

            <button
              type="button"
              onClick={() =>
                updateTask({
                  dueDate:
                    dueDate || null,
                })
              }
              className="mt-2 h-9 w-full rounded-md bg-[var(--foreground)] text-sm font-medium text-[var(--background)]"
            >
              Apply
            </button>

            {dueDate && (
              <button
                type="button"
                onClick={() =>
                  updateTask({
                    dueDate: null,
                  })
                }
                className="mt-1.5 h-8 w-full rounded-md text-left text-xs text-[var(--foreground-secondary)] hover:bg-[var(--surface-secondary)]"
              >
                Clear due date
              </button>
            )}
          </div>
        )}
    </div>,
    document.body,
  );
}

function TaskRow({
  task,
  onOpenTask,
  onOpenActions,
  actionOpen,
  onChangeTask,
}: {
  task: Task;
  onOpenTask: (
    taskId: string,
  ) => void;
  onOpenActions: (
    taskId: string,
  ) => void;
  actionOpen: boolean;
  onChangeTask: (
    taskId: string,
    changes: {
      priority?: Priority;
      status?: TaskStatus;
      dueDate?: string | null;
    },
  ) => void;
}) {
  const actionButtonRef =
    useRef<HTMLButtonElement>(null);

  return (
    <div className="grid min-w-[780px] grid-cols-[minmax(240px,1fr)_140px_120px_140px_140px] items-center border-b border-[var(--border)] bg-[var(--background)] last:border-b-0">
      <button
        type="button"
        onClick={() =>
          onOpenTask(task.id)
        }
        className="px-3 py-3 text-left text-sm font-medium text-[var(--foreground)] transition-colors hover:text-[var(--primary)] hover:underline"
      >
        {task.title}
      </button>

      <div className="flex items-center justify-center px-3 py-3">
        <PriorityBadge
          priority={task.priority}
        />
      </div>

      <div className="flex items-center justify-center px-3 py-3">
        <MemberAvatar
          member={task.member}
          avatar={task.avatar}
        />
      </div>

      <div className="flex items-center justify-center px-3 py-3 text-sm text-[var(--foreground-secondary)]">
        {task.dueDate || "-"}
      </div>

      <div className="flex items-center justify-center px-3 py-3">
        <button
          ref={actionButtonRef}
          type="button"
          onClick={(event) => {
            event.stopPropagation();

            onOpenActions(
              actionOpen
                ? ""
                : task.id,
            );
          }}
          className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--primary-muted)] hover:text-[var(--primary)]"
        >
          <MoreHorizontal
            size={16}
            strokeWidth={2}
          />
        </button>

        {actionOpen && (
          <TaskActionMenu
            task={task}
            anchorRef={
              actionButtonRef
            }
            onClose={() =>
              onOpenActions("")
            }
            onChange={
              onChangeTask
            }
          />
        )}
      </div>
    </div>
  );
}

function BoardTaskCard({
  task,
  onOpenTask,
  onOpenActions,
  actionOpen,
  onChangeTask,
}: {
  task: Task;
  onOpenTask: (
    taskId: string,
  ) => void;
  onOpenActions: (
    taskId: string,
  ) => void;
  actionOpen: boolean;
  onChangeTask: (
    taskId: string,
    changes: {
      priority?: Priority;
      status?: TaskStatus;
      dueDate?: string | null;
    },
  ) => void;
}) {
  const actionButtonRef =
    useRef<HTMLButtonElement>(null);

  return (
    <div className="mx-3 mb-3 block w-[calc(100%-24px)] rounded-md border border-[var(--border)] bg-[var(--background)] p-3 transition-all hover:border-[var(--primary)] hover:shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() =>
            onOpenTask(task.id)
          }
          className="min-w-0 flex-1 truncate text-left text-sm font-medium leading-5 text-[var(--foreground)]"
        >
          {task.title}
        </button>

        <button
          ref={actionButtonRef}
          type="button"
          onClick={(event) => {
            event.stopPropagation();

            onOpenActions(
              actionOpen
                ? ""
                : task.id,
            );
          }}
          className="flex h-5 w-5 shrink-0 items-center justify-center text-[var(--foreground-secondary)] hover:text-[var(--primary)]"
        >
          <MoreHorizontal
            size={14}
            strokeWidth={2}
          />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1">
          <MemberAvatar
            member={task.member}
            avatar={task.avatar}
          />

          <span className="truncate text-xs font-medium leading-4 text-[var(--foreground-secondary)]">
            {task.member}
          </span>
        </div>

        {task.dueDate && (
          <div className="flex h-5 shrink-0 items-center gap-1 rounded-3xl bg-[var(--primary-muted)] px-2 text-[var(--primary)]">
            <span className="text-xs font-medium leading-4">
              {task.dueDate.replace(
                /\s\d{4}$/,
                "",
              )}
            </span>
          </div>
        )}
      </div>

      <div className="mt-3">
        <PriorityBadge
          priority={task.priority}
        />
      </div>

      {actionOpen && (
        <TaskActionMenu
          task={task}
          anchorRef={
            actionButtonRef
          }
          onClose={() =>
            onOpenActions("")
          }
          onChange={
            onChangeTask
          }
        />
      )}
    </div>
  );
}

function ListTaskSection({
  section,
  collapsed,
  onToggle,
  onAddTask,
  onOpenTask,
  openActionTaskId,
  onOpenActions,
  onChangeTask,
}: {
  section: TaskSection;
  collapsed: boolean;
  onToggle: () => void;
  onAddTask: (
    sectionId: TaskStatus,
  ) => void;
  onOpenTask: (
    taskId: string,
  ) => void;
  openActionTaskId: string | null;
  onOpenActions: (
    taskId: string,
  ) => void;
  onChangeTask: (
    taskId: string,
    changes: {
      priority?: Priority;
      status?: TaskStatus;
      dueDate?: string | null;
    },
  ) => void;
}) {
  return (
    <section>
      <div className="flex h-10 items-center gap-2">
        <button
          type="button"
          onClick={onToggle}
          className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--primary-muted)] hover:text-[var(--primary)]"
        >
          <ChevronDown
            size={16}
            strokeWidth={2}
            className={
              collapsed
                ? "-rotate-90 transition-transform"
                : "rotate-0 transition-transform"
            }
          />
        </button>

        <span className="text-sm font-medium text-[var(--foreground)]">
          {section.title}
        </span>
      </div>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${collapsed
          ? "grid-rows-[0fr] opacity-0"
          : "grid-rows-[1fr] opacity-100"
          }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="w-full overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--background)]">
            <div className="min-w-[780px]">
              <div className="grid h-12 min-w-[780px] grid-cols-[minmax(240px,1fr)_140px_120px_140px_140px] items-center border-b border-[var(--border)] bg-[var(--surface-secondary)]">
                <div className="px-3 text-left text-sm font-medium text-[var(--foreground)]">
                  Task
                </div>

                <div className="px-3 text-center text-sm font-medium text-[var(--foreground)]">
                  Priority
                </div>

                <div className="px-3 text-center text-sm font-medium text-[var(--foreground)]">
                  Members
                </div>

                <div className="px-3 text-center text-sm font-medium text-[var(--foreground)]">
                  Due Date
                </div>

                <div className="px-3 text-center text-sm font-medium text-[var(--foreground)]">
                  Actions
                </div>
              </div>

              {section.tasks.map(
                (task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onOpenTask={
                      onOpenTask
                    }
                    onOpenActions={
                      onOpenActions
                    }
                    actionOpen={
                      openActionTaskId ===
                      task.id
                    }
                    onChangeTask={
                      onChangeTask
                    }
                  />
                ),
              )}

              <button
                type="button"
                onClick={() =>
                  onAddTask(
                    section.id,
                  )
                }
                className="flex h-12 w-full items-center gap-1 px-3 text-sm font-medium text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--primary-muted)] hover:text-[var(--primary)]"
              >
                <Plus
                  size={16}
                  strokeWidth={2}
                />

                Add Task
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BoardSection({
  section,
  onAddTask,
  onOpenTask,
  openActionTaskId,
  onOpenActions,
  onChangeTask,
}: {
  section: TaskSection;
  onAddTask: (
    sectionId: TaskStatus,
  ) => void;
  onOpenTask: (
    taskId: string,
  ) => void;
  openActionTaskId: string | null;
  onOpenActions: (
    taskId: string,
  ) => void;
  onChangeTask: (
    taskId: string,
    changes: {
      priority?: Priority;
      status?: TaskStatus;
      dueDate?: string | null;
    },
  ) => void;
}) {
  return (
    <section className="h-fit w-[289px] shrink-0 overflow-visible rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)]">
      <div className="flex h-[39px] items-center justify-between border-b border-[var(--border)] px-3">
        <div className="flex items-center gap-2">
          <Columns3
            size={14}
            strokeWidth={2}
            className="text-[var(--primary)]"
          />

          <span className="text-xs font-semibold leading-[100%] text-[var(--foreground)]">
            {section.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              onAddTask(
                section.id,
              )
            }
            className="flex h-5 w-5 items-center justify-center rounded-md text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--primary-muted)] hover:text-[var(--primary)]"
          >
            <Plus
              size={14}
              strokeWidth={2}
            />
          </button>

          <button
            type="button"
            className="flex h-5 w-5 items-center justify-center rounded-md text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--primary-muted)] hover:text-[var(--primary)]"
          >
            <MoreHorizontal
              size={14}
              strokeWidth={2}
            />
          </button>
        </div>
      </div>

      <div>
        {section.tasks.map(
          (task) => (
            <BoardTaskCard
              key={task.id}
              task={task}
              onOpenTask={
                onOpenTask
              }
              onOpenActions={
                onOpenActions
              }
              actionOpen={
                openActionTaskId ===
                task.id
              }
              onChangeTask={
                onChangeTask
              }
            />
          ),
        )}
      </div>

      <div className="flex h-[39px] items-center px-3">
        <button
          type="button"
          onClick={() =>
            onAddTask(
              section.id,
            )
          }
          className="flex h-6 items-center gap-1 rounded-full px-2 text-xs font-medium text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--primary-muted)] hover:text-[var(--primary)]"
        >
          <Plus
            size={12}
            strokeWidth={2}
          />

          <span>Add Task</span>
        </button>
      </div>
    </section>
  );
}

export default function TaskBoard() {
  const { user } =
    useAuth();

  const router =
    useRouter();

  const [
    sections,
    setSections,
  ] = useState<TaskSection[]>(
    initialSections,
  );

  const [
    savedSections,
    setSavedSections,
  ] = useState<TaskSection[]>(
    initialSections,
  );

  const [
    pendingChanges,
    setPendingChanges,
  ] = useState<PendingChanges>(
    {},
  );

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    saveError,
    setSaveError,
  ] = useState("");

  const [
    filters,
    setFilters,
  ] = useState<FilterState>(
    initialFilters,
  );

  const [
    viewMode,
    setViewMode,
  ] = useState<ViewMode>(
    "list",
  );

  const [
    collapsedSections,
    setCollapsedSections,
  ] = useState<
    Record<string, boolean>
  >({});

  const [
    isAddTaskOpen,
    setIsAddTaskOpen,
  ] = useState(false);

  const [
    selectedSectionId,
    setSelectedSectionId,
  ] = useState<TaskStatus | null>(
    null,
  );

  const [
    projectId,
    setProjectId,
  ] = useState("");

  const [
    openActionTaskId,
    setOpenActionTaskId,
  ] = useState<
    string | null
  >(null);

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  useEffect(() => {
    const fetchTasks =
      async () => {
        try {
          const response =
            await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/tasks?limit=100`,
            );

          if (!response.ok) {
            throw new Error(
              "Failed to fetch tasks",
            );
          }

          const result:
            | BackendTask[]
            | {
              data: BackendTask[];
            } =
            await response.json();

          const tasks =
            Array.isArray(result)
              ? result
              : result.data;

          const formattedSections =
            initialSections.map(
              (section) => ({
                ...section,
                tasks:
                  tasks
                    .filter(
                      (task) =>
                        task.status ===
                        section.id,
                    )
                    .map(
                      formatTask,
                    ),
              }),
            );

          setSections(
            formattedSections,
          );

          setSavedSections(
            formattedSections,
          );

          setPendingChanges(
            {},
          );
        } catch (error) {
          console.error(
            "Failed to fetch tasks:",
            error,
          );
        }
      };

    fetchTasks();
  }, []);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const fetchProjects =
      async () => {
        try {
          const response =
            await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/projects/owner/${user.id}`,
            );

          if (!response.ok) {
            throw new Error(
              "Failed to fetch projects",
            );
          }

          const projects:
            BackendProject[] =
            await response.json();

          if (
            projects.length > 0
          ) {
            setProjectId(
              projects[0].id,
            );
          }
        } catch (error) {
          console.error(
            "Failed to fetch projects:",
            error,
          );
        }
      };

    fetchProjects();
  }, [user?.id]);

  const changeTaskLocally = (
    taskId: string,
    changes: {
      priority?: Priority;
      status?: TaskStatus;
      dueDate?: string | null;
    },
  ) => {
    setSaveError("");

    setSections(
      (currentSections) => {
        const currentTask =
          currentSections
            .flatMap(
              (section) =>
                section.tasks,
            )
            .find(
              (task) =>
                task.id ===
                taskId,
            );

        if (!currentTask) {
          return currentSections;
        }

        const updatedTask: Task = {
          ...currentTask,
          priority:
            changes.priority ??
            currentTask.priority,
          status:
            changes.status ??
            currentTask.status,
          dueDateValue:
            changes.dueDate !==
              undefined
              ? changes.dueDate
              : currentTask.dueDateValue,
          dueDate:
            changes.dueDate !==
              undefined
              ? formatDueDate(
                changes.dueDate,
              )
              : currentTask.dueDate,
        };

        const withoutTask =
          currentSections.map(
            (section) => ({
              ...section,
              tasks:
                section.tasks.filter(
                  (task) =>
                    task.id !==
                    taskId,
                ),
            }),
          );

        return withoutTask.map(
          (section) => {
            if (
              section.id !==
              updatedTask.status
            ) {
              return section;
            }

            return {
              ...section,
              tasks: [
                ...section.tasks,
                updatedTask,
              ],
            };
          },
        );
      },
    );

    setPendingChanges(
      (currentChanges) => {
        const existing =
          currentChanges[taskId];

        const currentTask =
          sections
            .flatMap(
              (section) =>
                section.tasks,
            )
            .find(
              (task) =>
                task.id ===
                taskId,
            );

        if (!currentTask) {
          return currentChanges;
        }

        return {
          ...currentChanges,
          [taskId]: {
            priority:
              changes.priority ??
              existing?.priority ??
              currentTask.priority,
            status:
              changes.status ??
              existing?.status ??
              currentTask.status,
            dueDate:
              changes.dueDate !==
                undefined
                ? changes.dueDate
                : existing?.dueDate !==
                  undefined
                  ? existing.dueDate
                  : currentTask.dueDateValue,
          },
        };
      },
    );
  };

  const discardChanges = () => {
    setSections(
      savedSections,
    );

    setPendingChanges(
      {},
    );

    setSaveError("");

    setOpenActionTaskId(
      null,
    );
  };

  const saveAllChanges =
    async () => {
      if (
        Object.keys(
          pendingChanges,
        ).length === 0
      ) {
        return;
      }

      try {
        setIsSaving(true);

        setSaveError("");

        const currentTasks =
          sections.flatMap(
            (section) =>
              section.tasks,
          );

        await Promise.all(
          Object.entries(
            pendingChanges,
          ).map(
            async (
              [
                taskId,
                changes,
              ],
            ) => {
              const task =
                currentTasks.find(
                  (item) =>
                    item.id ===
                    taskId,
                );

              if (!task) {
                throw new Error(
                  "Task not found",
                );
              }

              const payload = {
                title:
                  task.title,
                description:
                  task.description,
                status:
                  changes.status,
                priority:
                  priorityToBackend[
                  changes.priority
                  ],
                dueDate:
                  changes.dueDate,
              };

              const response =
                await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}`,
                  {
                    method: "PATCH",
                    headers: {
                      "Content-Type":
                        "application/json",
                    },
                    body:
                      JSON.stringify(
                        payload,
                      ),
                  },
                );

              if (
                !response.ok
              ) {
                throw new Error(
                  "Failed to update task",
                );
              }
            },
          ),
        );

        setSavedSections(
          sections,
        );

        setPendingChanges(
          {},
        );

        setOpenActionTaskId(
          null,
        );
      } catch (error) {
        console.error(
          "Failed to save changes:",
          error,
        );

        setSaveError(
          "Failed to save changes. Please try again.",
        );
      } finally {
        setIsSaving(false);
      }
    };

  const filteredSections =
    initialSections.map(
      (sectionDefinition) => {
        const section =
          sections.find(
            (item) =>
              item.id ===
              sectionDefinition.id,
          ) ??
          sectionDefinition;

let filteredTasks =
  section.tasks.filter(
    (task) => {
      const statusMatches =
        filters.status.length === 0 ||
        filters.status.includes(
          statusLabels[
            task.status
          ],
        );

      const priorityMatches =
        filters.priority.length === 0 ||
        filters.priority.includes(
          task.priority,
        );

      const searchMatches =
        task.title
          .toLowerCase()
          .includes(
            searchQuery
              .trim()
              .toLowerCase(),
          );

      return (
        statusMatches &&
        priorityMatches &&
        searchMatches
      );
    },
  );

        if (
          filters.dueDate
        ) {
          filteredTasks = [
            ...filteredTasks,
          ].sort(
            (a, b) => {
              const aDate =
                a.dueDateValue
                  ? new Date(
                    a.dueDateValue,
                  ).getTime()
                  : Number.MAX_SAFE_INTEGER;

              const bDate =
                b.dueDateValue
                  ? new Date(
                    b.dueDateValue,
                  ).getTime()
                  : Number.MAX_SAFE_INTEGER;

              return filters.dueDate ===
                "Increasing"
                ? aDate -
                bDate
                : bDate -
                aDate;
            },
          );
        }

        return {
          ...section,
          tasks:
            filteredTasks,
        };
      },
    );

  const toggleSection = (
    sectionId: string,
  ) => {
    setCollapsedSections(
      (current) => ({
        ...current,
        [sectionId]:
          !current[sectionId],
      }),
    );
  };

  const openAddTaskModal = (
    sectionId: TaskStatus,
  ) => {
    setSelectedSectionId(
      sectionId,
    );

    setIsAddTaskOpen(
      true,
    );
  };

  const closeAddTaskModal =
    () => {
      setIsAddTaskOpen(
        false,
      );

      setSelectedSectionId(
        null,
      );
    };

  const addTask = (
    task: Task,
  ) => {
    setSections(
      (
        currentSections,
      ) => {
        const updatedSections =
          currentSections.map(
            (section) => {
              if (
                section.id !==
                task.status
              ) {
                return section;
              }

              return {
                ...section,
                tasks: [
                  ...section.tasks,
                  task,
                ],
              };
            },
          );

        setSavedSections(
          updatedSections,
        );

        return updatedSections;
      },
    );
  };

  const addTaskToFirstSection =
    () => {
      openAddTaskModal(
        "todo",
      );
    };

  const hasPendingChanges =
    Object.keys(
      pendingChanges,
    ).length > 0;

  return (
    <div className="min-h-screen min-w-0 w-full bg-[var(--background)] text-[var(--foreground)]">
      <main className="w-full px-4 py-4">
        <div className="mx-auto w-full max-w-[992px]">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h1 className="text-base font-semibold leading-4 text-[var(--foreground)]">
              Tasks
            </h1>

            <BoardActions
  viewMode={viewMode}
  onViewModeChange={
    setViewMode
  }
  addButtonLabel="Add Task"
  onAdd={
    addTaskToFirstSection
  }
  onFilterChange={
    setFilters
  }
  searchValue={
    searchQuery
  }
  onSearchChange={
    setSearchQuery
  }
/>
          </div>

          {viewMode ===
            "list" ? (
            <div className="flex w-full flex-col gap-5">
              {filteredSections.map(
                (
                  section,
                ) => (
                  <ListTaskSection
                    key={
                      section.id
                    }
                    section={
                      section
                    }
                    collapsed={
                      collapsedSections[
                      section.id
                      ] ??
                      false
                    }
                    onToggle={() =>
                      toggleSection(
                        section.id,
                      )
                    }
                    onAddTask={
                      openAddTaskModal
                    }
                    onOpenTask={(
                      taskId,
                    ) =>
                      router.push(
                        `/tasks/${taskId}`,
                      )
                    }
                    openActionTaskId={
                      openActionTaskId
                    }
                    onOpenActions={(
                      taskId,
                    ) =>
                      setOpenActionTaskId(
                        taskId ||
                        null,
                      )
                    }
                    onChangeTask={
                      changeTaskLocally
                    }
                  />
                ),
              )}
            </div>
          ) : (
            <div className="flex w-full items-start gap-4 overflow-x-auto pb-4">
              {filteredSections.map(
                (
                  section,
                ) => (
                  <BoardSection
                    key={
                      section.id
                    }
                    section={
                      section
                    }
                    onAddTask={
                      openAddTaskModal
                    }
                    onOpenTask={(
                      taskId,
                    ) =>
                      router.push(
                        `/tasks/${taskId}`,
                      )
                    }
                    openActionTaskId={
                      openActionTaskId
                    }
                    onOpenActions={(
                      taskId,
                    ) =>
                      setOpenActionTaskId(
                        taskId ||
                        null,
                      )
                    }
                    onChangeTask={
                      changeTaskLocally
                    }
                  />
                ),
              )}
            </div>
          )}
        </div>
      </main>

      <AddTaskModal
        isOpen={
          isAddTaskOpen
        }
        onClose={
          closeAddTaskModal
        }
        onCreate={
          addTask
        }
        projectId={
          projectId
        }
        defaultStatus={
          selectedSectionId ??
          "todo"
        }
      />

      {hasPendingChanges && (
        <div className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-end gap-3 border-t border-[var(--border)] bg-[var(--surface)] px-8 shadow-lg">
          <div className="mr-auto">
            <span className="text-sm text-[var(--foreground-secondary)]">
              You have unsaved changes
            </span>

            {saveError && (
              <p className="mt-1 text-xs text-red-500">
                {saveError}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={
              discardChanges
            }
            disabled={
              isSaving
            }
            className="rounded-md border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-secondary)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Discard
          </button>

          <button
            type="button"
            onClick={
              saveAllChanges
            }
            disabled={
              isSaving
            }
            className="rounded-md bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}