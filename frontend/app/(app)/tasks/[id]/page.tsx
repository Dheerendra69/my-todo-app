"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";
import { useParams, useRouter } from "next/navigation";


import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Circle,
  Eye,
  FileText,
  Lock,
  MoreHorizontal,
  Plus,
  SendHorizontal,
  SmilePlus,
  Paperclip,
  Settings,
  Share2,
  SignalHigh,
  SignalLow,
  Trash2,
  UserRound,
  X,
  Check,
  Signal,
  SignalMedium,
} from "lucide-react";
import { useAuth } from "@/app/components/Auth/AuthContext";

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

type BackendPriority =
  | "no_priority"
  | "urgent"
  | "high"
  | "medium"
  | "low";

type Assignee = {
  id: string;
  name: string;
  avatar?: string | null;
};

type BackendTask = {
  id: string;
  title: string;
  description: string | null;
  priority: BackendPriority;
  dueDate: string | null;
  status: TaskStatus;
  project?: {
    id: string;
    name: string;
  };
  assignee: Assignee | null;
};

type CommentAuthor = {
  id: string;
  name: string;
  avatar: string | null;
};

type CommentReply = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: CommentAuthor;
};

type TaskComment = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: CommentAuthor;
  replies: CommentReply[];
};

function formatCommentTime(
  createdAt: string,
) {
  const seconds = Math.max(
    0,
    Math.floor(
      (Date.now() -
        new Date(createdAt).getTime()) /
      1000,
    ),
  );

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(
    seconds / 60,
  );

  if (minutes < 60) {
    return `${minutes} min${minutes === 1 ? "" : "s"
      } ago`;
  }

  const hours = Math.floor(
    minutes / 60,
  );

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"
      } ago`;
  }

  const days = Math.floor(
    hours / 24,
  );

  if (days < 7) {
    return `${days} day${days === 1 ? "" : "s"
      } ago`;
  }

  const weeks = Math.floor(
    days / 7,
  );

  if (weeks < 4) {
    return `${weeks} week${weeks === 1 ? "" : "s"
      } ago`;
  }

  const months = Math.floor(
    days / 30,
  );

  if (months < 12) {
    return `${months} month${months === 1 ? "" : "s"
      } ago`;
  }

  const years = Math.floor(
    days / 365,
  );

  return `${years} year${years === 1 ? "" : "s"
    } ago`;
}

function CommentAvatar({
  name,
  avatar,
}: {
  name: string;
  avatar?: string | null;
}) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className="h-5 w-5 rounded-full object-cover"
      />
    );
  }

  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary-muted)] text-[10px] font-medium text-[var(--primary)]">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

const priorityConfig: Record<
  Priority,
  {
    icon: typeof SignalHigh;
    className: string;
  }
> = {
  "No Priority": {
    icon: Circle,
    className: "text-[var(--foreground-secondary)]",
  },
  Urgent: {
    icon: SignalHigh,
    className: "text-red-500",
  },
  High: {
    icon: SignalHigh,
    className: "text-red-500",
  },
  Medium: {
    icon: SignalHigh,
    className: "text-orange-500",
  },
  Low: {
    icon: SignalLow,
    className: "text-slate-400",
  },
};

const priorityToFrontend: Record<
  BackendPriority,
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
  BackendPriority
> = {
  "No Priority": "no_priority",
  Urgent: "urgent",
  High: "high",
  Medium: "medium",
  Low: "low",
};

const statusLabels: Record<
  TaskStatus,
  string
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

function PriorityBadge({
  priority,
}: {
  priority: Priority;
}) {
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
function formatDate(
  date: string | null,
) {
  if (!date) {
    return "";
  }

  return new Date(
    date,
  ).toLocaleDateString(
    "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
}

function toInputDate(
  date: string | null,
) {
  if (!date) {
    return "";
  }

  return new Date(
    date,
  )
    .toISOString()
    .split("T")[0];
}

function TaskActionMenu({
  subtask,
  anchorRef,
  onClose,
  onChange,
  onDelete,
}: {
  subtask: BackendTask;
  anchorRef: React.RefObject<
    HTMLButtonElement | null
  >;
  onClose: () => void;
  onChange: (
    subtaskId: string,
    changes: {
      priority?: BackendPriority;
      status?: TaskStatus;
      dueDate?: string | null;
    },
  ) => void;
  onDelete: (
    subtaskId: string,
  ) => void;
}) {
  const [
    activeCategory,
    setActiveCategory,
  ] = useState<
    | "Status"
    | "Priority"
    | "Due Date"
    | null
  >(null);

  const [
    priority,
    setPriority,
  ] = useState<Priority>(
    priorityToFrontend[
    subtask.priority
    ],
  );

  const [
    status,
    setStatus,
  ] = useState<TaskStatus>(
    subtask.status,
  );

  const [
    dueDate,
    setDueDate,
  ] = useState(
    toInputDate(
      subtask.dueDate,
    ),
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
      priorityToFrontend[
      subtask.priority
      ],
    );

    setStatus(
      subtask.status,
    );

    setDueDate(
      toInputDate(
        subtask.dueDate,
      ),
    );
  }, [
    subtask.priority,
    subtask.status,
    subtask.dueDate,
  ]);

  useLayoutEffect(() => {
    const updatePosition = () => {
      if (!anchorRef.current) {
        return;
      }

      const rect =
        anchorRef.current.getBoundingClientRect();

      setPosition({
        top:
          rect.top +
          rect.height / 2 -
          72,
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
      if (
        event.key ===
        "Escape"
      ) {
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
    anchorRef,
    onClose,
  ]);

  const updateSubtask = (
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
      changes.dueDate !==
        undefined
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
      subtask.id,
      {
        priority:
          priorityToBackend[
          updatedPriority
          ],
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

        <div className="my-1 border-t border-[var(--border)]" />

        <button
          type="button"
          onClick={() => {
            onDelete(
              subtask.id,
            );

            onClose();
          }}
          className="flex h-9 w-full items-center gap-2.5 rounded-md px-3 text-red-500 hover:bg-[var(--surface-secondary)]"
        >
          <Trash2
            size={16}
            strokeWidth={1.8}
          />

          <span className="text-sm">
            Delete
          </span>
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
                  key={
                    option.value
                  }
                  type="button"
                  onClick={() =>
                    updateSubtask({
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
                    updateSubtask({
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
              onChange={(
                event,
              ) =>
                setDueDate(
                  event.target.value,
                )
              }
              className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm text-[var(--foreground)] outline-none"
            />

            <button
              type="button"
              onClick={() =>
                updateSubtask({
                  dueDate:
                    dueDate ||
                    null,
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
                  updateSubtask({
                    dueDate:
                      null,
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

function SubtaskRow({
  subtask,
  onOpenTask,
  actionOpen,
  onToggleActions,
  onChange,
  onDelete,
}: {
  subtask: BackendTask;
  onOpenTask: (
    taskId: string,
  ) => void;
  actionOpen: boolean;
  onToggleActions: () => void;
  onChange: (
    subtaskId: string,
    payload: Partial<{
      priority: BackendPriority;
      status: TaskStatus;
      dueDate: string | null;
    }>,
  ) => void;
  onDelete: (
    subtaskId: string,
  ) => void;
}) {
  const actionButtonRef =
    useRef<HTMLButtonElement>(
      null,
    );

  return (
    <div className="grid min-h-11 grid-cols-[1.2fr_1fr_1fr_1.2fr_80px] items-center border-b border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] last:border-b-0">
      <button
        type="button"
        onClick={() =>
          onOpenTask(
            subtask.id,
          )
        }
        className="px-3 py-3 text-left font-medium transition-colors hover:text-[var(--primary)] hover:underline"
      >
        {subtask.title}
      </button>

      <div className="flex items-center px-3">
        <PriorityBadge
          priority={
            priorityToFrontend[
            subtask.priority
            ]
          }
        />
      </div>

      <div className="flex items-center px-3">
        {subtask.assignee ? (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary-muted)] text-[10px] font-medium text-[var(--primary)]">
            {subtask.assignee.name.charAt(
              0,
            )}
          </div>
        ) : (
          <span className="text-xs text-[var(--foreground-secondary)]">
            Unassigned
          </span>
        )}
      </div>

      <div className="px-3 text-xs text-[var(--foreground-secondary)]">
        {formatDate(
          subtask.dueDate,
        ) || "-"}
      </div>

      <div className="flex items-center justify-center px-2">
        <button
          ref={actionButtonRef}
          type="button"
          onClick={(
            event,
          ) => {
            event.stopPropagation();

            onToggleActions();
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
            subtask={subtask}
            anchorRef={
              actionButtonRef
            }
            onClose={
              onToggleActions
            }
            onChange={
              onChange
            }
            onDelete={
              onDelete
            }
          />
        )}
      </div>
    </div>
  );
}

export default function TaskDetailsPage() {
  const params =
    useParams();



  const router =
    useRouter();

  const { user } = useAuth();

  const taskId =
    params.id as string;

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState<TaskStatus>(
    "todo",
  );

  const [
    priority,
    setPriority,
  ] = useState<Priority>(
    "No Priority",
  );

  const [
    dueDate,
    setDueDate,
  ] = useState<string | null>(
    null,
  );

  const [
    assignee,
    setAssignee,
  ] = useState<Assignee | null>(
    null,
  );

  const [
    subtasks,
    setSubtasks,
  ] = useState<BackendTask[]>(
    [],
  );

  const [
    comments,
    setComments,
  ] = useState<TaskComment[]>(
    [],
  );

  const [
    newComment,
    setNewComment,
  ] = useState("");

  const [
    commentMenuId,
    setCommentMenuId,
  ] = useState<string | null>(
    null,
  );

  const [
    showDetails,
    setShowDetails,
  ] = useState(true);

  const [
    showSubtasks,
    setShowSubtasks,
  ] = useState(true);

  const [
    showUpdates,
    setShowUpdates,
  ] = useState(true);

  const [
    showPriorityMenu,
    setShowPriorityMenu,
  ] = useState(false);

  const [
    isDirty,
    setIsDirty,
  ] = useState(false);

  const [
    showUnsavedModal,
    setShowUnsavedModal,
  ] = useState(false);

  const [
    saved,
    setSaved,
  ] = useState(false);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    showAddSubtask,
    setShowAddSubtask,
  ] = useState(false);

  const [
    newSubtaskTitle,
    setNewSubtaskTitle,
  ] = useState("");

  const [
    newSubtaskPriority,
    setNewSubtaskPriority,
  ] = useState<Priority>(
    "No Priority",
  );

  const [
    newSubtaskDueDate,
    setNewSubtaskDueDate,
  ] = useState("");

  const [
    newSubtaskStatus,
    setNewSubtaskStatus,
  ] = useState<TaskStatus>(
    "todo",
  );

  const [
    activeSubtaskId,
    setActiveSubtaskId,
  ] = useState<string | null>(
    null,
  );

  const [
    replyingToCommentId,
    setReplyingToCommentId,
  ] = useState<string | null>(
    null,
  );

  const [
    replyContent,
    setReplyContent,
  ] = useState("");

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL;

  const fetchSubtasks =
    async () => {
      try {
        const response =
          await fetch(
            `${apiUrl}/tasks/${taskId}/subtasks`,
          );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch subtasks",
          );
        }

        const data:
          BackendTask[] =
          await response.json();

        setSubtasks(data);
      } catch (error) {
        console.error(
          "Failed to fetch subtasks:",
          error,
        );
      }
    };

  useEffect(() => {
    if (!taskId) {
      return;
    }

    const fetchComments =
      async () => {
        try {
          const token = localStorage.getItem("accessToken");

          const response = await fetch(
            `${apiUrl}/tasks/${taskId}/comments`,
            {
              method: "GET",
              headers: {
                Authorization: token ? `Bearer ${token}` : "",
              },
            },
          );

          if (!response.ok) {
            throw new Error(
              "Failed to fetch comments",
            );
          }

          const data: TaskComment[] =
            await response.json();

          setComments(data);
        } catch (error) {
          console.error(
            "Failed to fetch comments:",
            error,
          );
        }
      };

    const fetchTask =
      async () => {
        try {
          setIsLoading(true);

          const response =
            await fetch(
              `${apiUrl}/tasks/${taskId}`,
            );

          if (!response.ok) {
            throw new Error(
              "Failed to fetch task",
            );
          }

          const task:
            BackendTask =
            await response.json();

          setTitle(
            task.title,
          );

          setDescription(
            task.description ?? "",
          );

          setStatus(
            task.status,
          );

          setPriority(
            priorityToFrontend[
            task.priority
            ],
          );

          setDueDate(
            task.dueDate,
          );

          setAssignee(
            task.assignee,
          );

          setIsDirty(false);

          await Promise.all([
            fetchSubtasks(),
            fetchComments(),
          ]);
        } catch (error) {
          console.error(
            "Failed to fetch task:",
            error,
          );

          setError(
            "Failed to load task",
          );
        } finally {
          setIsLoading(false);
        }
      };

    fetchTask();
  }, [taskId]);

  useEffect(() => {
    const handleBeforeUnload = (
      event: BeforeUnloadEvent,
    ) => {
      if (!isDirty) {
        return;
      }

      event.preventDefault();

      event.returnValue =
        "";
    };

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload,
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload,
      );
    };
  }, [isDirty]);

  const updateField = (
    callback: () => void,
  ) => {
    callback();

    setIsDirty(true);

    setSaved(false);
  };

  const saveChanges =
    async () => {
      try {
        const payload = {
          title,
          description,
          status,
          priority:
            priorityToBackend[
            priority
            ],
          dueDate,
        };

        const response =
          await fetch(
            `${apiUrl}/tasks/${taskId}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify(
                payload,
              ),
            },
          );

        if (!response.ok) {
          throw new Error(
            "Failed to update task",
          );
        }

        setIsDirty(false);

        setSaved(true);

        setTimeout(() => {
          setSaved(false);
        }, 2500);
      } catch (error) {
        console.error(
          "Failed to save task:",
          error,
        );
      }
    };

  const createSubtask = async () => {
    if (!newSubtaskTitle.trim()) {
      return;
    }

    if (!user?.id) {
      console.error("Current user not found");
      return;
    }

    try {
      const payload = {
        title: newSubtaskTitle.trim(),
        priority: priorityToBackend[newSubtaskPriority],
        status: newSubtaskStatus,
        dueDate: newSubtaskDueDate || null,
        assigneeId: user.id,
      };

      const response = await fetch(
        `${apiUrl}/tasks/${taskId}/subtasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error(
          "Failed to create subtask",
        );
      }

      setNewSubtaskTitle("");
      setNewSubtaskPriority("No Priority");
      setNewSubtaskStatus("todo");
      setNewSubtaskDueDate("");
      setShowAddSubtask(false);

      await fetchSubtasks();
    } catch (error) {
      console.error(
        "Failed to create subtask:",
        error,
      );
    }
  };

  const updateSubtask =
    async (
      subtaskId: string,
      payload: Partial<{
        title: string;
        priority: BackendPriority;
        status: TaskStatus;
        dueDate: string | null;
      }>,
    ) => {
      try {
        const response =
          await fetch(
            `${apiUrl}/tasks/${subtaskId}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify(
                payload,
              ),
            },
          );

        if (!response.ok) {
          throw new Error(
            "Failed to update subtask",
          );
        }

        await fetchSubtasks();
      } catch (error) {
        console.error(
          "Failed to update subtask:",
          error,
        );
      }
    };

  const deleteSubtask =
    async (
      subtaskId: string,
    ) => {
      try {
        const response =
          await fetch(
            `${apiUrl}/tasks/${subtaskId}`,
            {
              method: "DELETE",
            },
          );

        if (!response.ok) {
          throw new Error(
            "Failed to delete subtask",
          );
        }

        setActiveSubtaskId(
          null,
        );

        await fetchSubtasks();
      } catch (error) {
        console.error(
          "Failed to delete subtask:",
          error,
        );
      }
    };

  const addComment =
    async () => {
      const content =
        newComment.trim();

      if (!content) {
        return;
      }

      try {
        const response =
          await fetch(
            `${apiUrl}/tasks/${taskId}/comments`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
                Authorization:
                  `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
              },
              credentials: "include",
              body: JSON.stringify({
                content,
              }),
            },
          );

        if (!response.ok) {
          throw new Error(
            "Failed to add comment",
          );
        }

        const createdComment:
          TaskComment =
          await response.json();

        setComments(
          (currentComments) => [
            ...currentComments,
            createdComment,
          ],
        );

        setNewComment("");
      } catch (error) {
        console.error(
          "Failed to add comment:",
          error,
        );
      }
    };

  const deleteComment =
    async (
      commentId: string,
    ) => {
      try {
        const response =
          await fetch(
            `${apiUrl}/tasks/${taskId}/comments/${commentId}`,
            {
              method: "DELETE",
              credentials: "include",
              headers: {
                Authorization:
                  `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
              }
            },
          );

        if (!response.ok) {
          throw new Error(
            "Failed to delete comment",
          );
        }

        setComments(
          (currentComments) =>
            currentComments.filter(
              (comment) =>
                comment.id !==
                commentId,
            ),
        );

        setCommentMenuId(
          null,
        );
      } catch (error) {
        console.error(
          "Failed to delete comment:",
          error,
        );
      }
    };

  const addReply =
    async (
      commentId: string,
    ) => {
      const content =
        replyContent.trim();

      if (!content) {
        return;
      }

      try {
        const response =
          await fetch(
            `${apiUrl}/comments/${commentId}/replies`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
                Authorization:
                  `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
              },
              credentials: "include",
              body: JSON.stringify({
                content,
              }),
            },
          );

        if (!response.ok) {
          throw new Error(
            "Failed to add reply",
          );
        }

        const createdReply:
          CommentReply =
          await response.json();

        setComments(
          (currentComments) =>
            currentComments.map(
              (comment) => {
                if (
                  comment.id !==
                  commentId
                ) {
                  return comment;
                }

                return {
                  ...comment,
                  replies: [
                    ...(
                      comment.replies ??
                      []
                    ),
                    createdReply,
                  ],
                };
              },
            ),
        );

        setReplyContent("");

        setReplyingToCommentId(
          null,
        );
      } catch (error) {
        console.error(
          "Failed to add reply:",
          error,
        );
      }
    };

  const closeTask = () => {
    if (isDirty) {
      setShowUnsavedModal(
        true,
      );

      return;
    }

    router.push(
      "/tasks",
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] text-[var(--foreground)]">
        <span className="text-sm text-[var(--foreground-secondary)]">
          Loading task...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--background)]">
        <p className="text-sm text-red-500">
          {error}
        </p>

        <button
          type="button"
          onClick={() =>
            router.push(
              "/tasks",
            )
          }
          className="rounded-md bg-[var(--foreground)] px-4 py-2 text-sm text-[var(--background)]"
        >
          Back to Tasks
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-auto bg-[var(--background)] text-[var(--foreground)]">
      <div className="min-w-[1050px]">
        <div className="mx-auto w-full max-w-[1180px] px-4 py-4">
          <div className="grid grid-cols-[minmax(680px,1fr)_323px] gap-5">
            <div className="col-span-2 flex items-start justify-between gap-6">
              <div className="min-w-0 flex-1">
                <input
                  value={title}
                  onChange={(e) =>
                    updateField(
                      () =>
                        setTitle(
                          e.target.value,
                        ),
                    )
                  }
                  className="w-full bg-transparent text-2xl font-semibold tracking-[-0.4px] text-[var(--foreground)] outline-none"
                />

                <textarea
                  value={description}
                  onChange={(e) =>
                    updateField(
                      () =>
                        setDescription(
                          e.target.value,
                        ),
                    )
                  }
                  rows={2}
                  className="mt-1 w-full resize-none bg-transparent text-sm leading-5 text-[var(--foreground-secondary)] outline-none"
                />
              </div>

              <div className="flex shrink-0 items-center gap-2 pt-1">
                <button
                  type="button"
                  className="flex h-8 items-center gap-2 rounded-md border border-[var(--border)] px-3 text-[var(--foreground)] hover:bg-[var(--surface-secondary)]"
                >
                  <Lock size={14} />
                </button>

                <button
                  type="button"
                  className="flex h-8 items-center gap-1.5 rounded-md border border-[var(--border)] px-3 text-xs text-indigo-500 hover:bg-[var(--surface-secondary)]"
                >
                  <Eye size={14} />

                  1
                </button>

                <button
                  type="button"
                  className="flex h-8 items-center rounded-md border border-[var(--border)] px-3 text-[var(--foreground)] hover:bg-[var(--surface-secondary)]"
                >
                  <Share2 size={14} />
                </button>

                <button
                  type="button"
                  onClick={closeTask}
                  className="flex h-8 items-center rounded-md border border-[var(--border)] bg-[var(--surface-secondary)] px-3 text-[var(--foreground)] hover:bg-[var(--surface)]"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            <main className="min-w-[680px]">
              <div className="space-y-2">
                <div className="flex min-h-7 items-center gap-3">
                  <span className="w-20 text-sm font-medium text-[var(--foreground-secondary)]">
                    Properties
                  </span>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      {assignee?.avatar ? (
                        <img
                          src={assignee.avatar}
                          alt={assignee.name}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--surface-secondary)] text-xs text-[var(--foreground)]">
                          {assignee?.name?.charAt(
                            0,
                          ) ?? "?"}
                        </span>
                      )}

                      <span className="text-sm font-medium text-[var(--foreground)]">
                        {assignee?.name ??
                          "Unassigned"}
                      </span>
                    </div>

                    {dueDate && (
                      <button
                        type="button"
                        className="flex h-5 items-center gap-1 rounded-full bg-red-500/10 px-2 text-xs font-medium text-red-500"
                      >
                        <Calendar size={12} />

                        {formatDate(
                          dueDate,
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <section className="mt-6">
                <div className="mb-3 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setShowSubtasks(
                        !showSubtasks,
                      )
                    }
                    className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--primary-muted)] hover:text-[var(--primary)]"
                  >
                    <ChevronDown
                      size={16}
                      strokeWidth={2}
                      className={
                        showSubtasks
                          ? "rotate-0 transition-transform"
                          : "-rotate-90 transition-transform"
                      }
                    />
                  </button>

                  <span className="text-sm font-medium text-[var(--foreground)]">
                    Subtasks
                  </span>
                </div>

                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${showSubtasks
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                    }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="overflow-visible rounded-md border border-[var(--border)]">
                      <div className="grid grid-cols-[1.2fr_1fr_1fr_1.2fr_75px] border-b border-[var(--border)] text-sm font-medium text-[var(--foreground)]">
                        <div className="px-3 py-4">
                          Task
                        </div>

                        <div className="px-3 py-4">
                          Priority
                        </div>

                        <div className="px-3 py-4">
                          Members
                        </div>

                        <div className="px-3 py-4">
                          Due Date
                        </div>

                        <div className="px-2 py-4">
                          Actions
                        </div>
                      </div>

                      {subtasks.length === 0 && (
                        <div className="px-3 py-8 text-center text-sm text-[var(--foreground-secondary)]">
                          No subtasks yet
                        </div>
                      )}

                      {subtasks.map(
                        (subtask) => (
                          <SubtaskRow
                            key={subtask.id}
                            subtask={subtask}
                            onOpenTask={(
                              subtaskId,
                            ) =>
                              router.push(
                                `/tasks/${subtaskId}`,
                              )
                            }
                            actionOpen={
                              activeSubtaskId ===
                              subtask.id
                            }
                            onToggleActions={() =>
                              setActiveSubtaskId(
                                activeSubtaskId ===
                                  subtask.id
                                  ? null
                                  : subtask.id,
                              )
                            }
                            onChange={
                              updateSubtask
                            }
                            onDelete={
                              deleteSubtask
                            }
                          />
                        ),
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setShowAddSubtask(
                            true,
                          )
                        }
                        className="flex h-12 w-full items-center gap-1 border-t border-[var(--border)] px-3 text-sm font-medium text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--primary-muted)] hover:text-[var(--primary)]"
                      >
                        <Plus
                          size={16}
                          strokeWidth={2}
                        />

                        Add Subtask
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mt-6 min-w-[680px]">
                <h3 className="mb-5 h-5 text-sm font-medium text-[var(--foreground)]">
                  Comments
                </h3>

                <div className="space-y-5">
                  {comments.map(
                    (comment) => (
                      <div
                        key={comment.id}
                        className="min-h-[135px] overflow-visible rounded-md border border-[var(--border)] bg-[var(--background)]"
                      >
                        <div className="min-h-[86px] rounded-t-md border-b border-[var(--border)] p-4">
                          <div className="flex h-full flex-col gap-2">
                            <div className="flex h-[21px] items-center justify-between">
                              <div className="flex items-center gap-2">
                                <CommentAvatar
                                  name={
                                    comment.author
                                      .name
                                  }
                                  avatar={
                                    comment.author
                                      .avatar
                                  }
                                />

                                <span className="text-xs font-medium text-[var(--foreground)]">
                                  {
                                    comment.author
                                      .name
                                  }
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="text-xs text-[var(--foreground-secondary)]">
                                  {formatCommentTime(
                                    comment.createdAt,
                                  )}
                                </span>

                                <button
                                  type="button"
                                  className="flex h-4 w-4 items-center justify-center text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
                                  aria-label="Add reaction"
                                >
                                  <SmilePlus
                                    size={16}
                                    strokeWidth={1.8}
                                  />
                                </button>

                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setCommentMenuId(
                                        commentMenuId ===
                                          comment.id
                                          ? null
                                          : comment.id,
                                      )
                                    }
                                    className="flex h-5 w-5 items-center justify-center text-[var(--foreground)]"
                                    aria-label="Comment actions"
                                  >
                                    <MoreHorizontal
                                      size={16}
                                      strokeWidth={2}
                                    />
                                  </button>

                                  {commentMenuId ===
                                    comment.id && (
                                      <div className="absolute right-0 top-6 z-20 w-24 rounded-md border border-[var(--border)] bg-[var(--surface)] p-1 shadow-lg">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            deleteComment(
                                              comment.id,
                                            )
                                          }
                                          className="flex h-8 w-full items-center rounded px-2 text-xs text-red-500 hover:bg-[var(--surface-secondary)]"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    )}
                                </div>
                              </div>
                            </div>

                            <p className="text-base leading-6 text-[var(--foreground)]">
                              {comment.content}
                            </p>
                          </div>
                        </div>

                        <div className="flex h-[48px] items-center gap-2 px-4 py-3">
                          <CommentAvatar
                            name={
                              user?.name ??
                              "You"
                            }
                            avatar={
                              user?.avatar
                            }
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setReplyingToCommentId(
                                replyingToCommentId ===
                                  comment.id
                                  ? null
                                  : comment.id,
                              )
                            }
                            className="text-sm text-neutral-400 transition-colors hover:text-[var(--foreground)]"
                          >
                            Leave a reply
                          </button>

                          <Paperclip
                            size={16}
                            strokeWidth={1.8}
                            className="ml-auto text-[var(--foreground-secondary)]"
                          />

                          <SendHorizontal
                            size={16}
                            strokeWidth={1.8}
                            className="text-[var(--foreground-secondary)]"
                          />
                        </div>
                      </div>
                    ),
                  )}

                  <div className="flex h-16 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-4">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(event) =>
                        setNewComment(
                          event.target.value,
                        )
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" &&
                          !event.shiftKey
                        ) {
                          event.preventDefault();
                          addComment();
                        }
                      }}
                      placeholder="Add a comment..."
                      className="min-w-0 flex-1 bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--foreground-secondary)]"
                    />

                    <button
                      type="button"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)]"
                      aria-label="Attach file"
                    >
                      <Paperclip
                        size={16}
                        strokeWidth={1.8}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={addComment}
                      disabled={
                        !newComment.trim()
                      }
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Send comment"
                    >
                      <SendHorizontal
                        size={16}
                        strokeWidth={1.8}
                      />
                    </button>
                  </div>
                </div>
              </section>
            </main>

            <aside className="w-[323px] min-w-[323px]">
              <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      setShowDetails(
                        !showDetails,
                      )
                    }
                    className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]"
                  >
                    {showDetails ? (
                      <ChevronDown
                        size={16}
                      />
                    ) : (
                      <ChevronRight
                        size={16}
                      />
                    )}

                    Details
                  </button>

                  <div className="flex items-center gap-4 text-[var(--foreground)]">
                    <Plus size={16} />

                    <Settings size={16} />
                  </div>
                </div>

                {showDetails && (
                  <div className="mt-5 space-y-5">
                    <div className="grid grid-cols-[90px_1fr] items-center">
                      <span className="text-xs text-[var(--foreground-secondary)]">
                        Status
                      </span>

                      <span className="flex items-center gap-1 text-xs font-medium text-orange-500">
                        <Circle
                          size={12}
                          fill="currentColor"
                        />

                        {
                          statusLabels[
                          status
                          ]
                        }
                      </span>
                    </div>

                    <div className="relative grid grid-cols-[90px_1fr] items-center">
                      <span className="text-xs text-[var(--foreground-secondary)]">
                        Priority
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setShowPriorityMenu(
                            !showPriorityMenu,
                          )
                        }
                        className="flex items-center gap-1 text-xs font-medium text-[var(--foreground)]"
                      >
                        <PriorityBadge
                          priority={
                            priority
                          }
                        />

                        <ChevronDown
                          size={12}
                        />
                      </button>

                      {showPriorityMenu && (
                        <div className="absolute right-0 top-7 z-50 w-52 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--foreground)] shadow-lg">
                          <p className="px-2 py-2 text-xs text-[var(--foreground-secondary)]">
                            Priority
                          </p>

                          {(
                            [
                              "No Priority",
                              "Urgent",
                              "High",
                              "Medium",
                              "Low",
                            ] as Priority[]
                          ).map(
                            (item) => (
                              <button
                                key={item}
                                type="button"
                                onClick={() => {
                                  updateField(
                                    () =>
                                      setPriority(
                                        item,
                                      ),
                                  );

                                  setShowPriorityMenu(
                                    false,
                                  );
                                }}
                                className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm hover:bg-[var(--surface-secondary)]"
                              >
                                <PriorityBadge
                                  priority={
                                    item
                                  }
                                />

                                {priority ===
                                  item && (
                                    <span>
                                      ✓
                                    </span>
                                  )}
                              </button>
                            ),
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-[90px_1fr] items-center">
                      <span className="text-xs text-[var(--foreground-secondary)]">
                        Members
                      </span>

                      <span className="flex items-center gap-2 text-xs font-medium text-[var(--foreground)]">
                        <UserRound
                          size={14}
                        />

                        {assignee?.name ??
                          "Unassigned"}
                      </span>
                    </div>

                    <div className="grid grid-cols-[90px_1fr] items-center">
                      <span className="text-xs text-[var(--foreground-secondary)]">
                        Due Date
                      </span>

                      {dueDate ? (
                        <button
                          type="button"
                          className="flex items-center gap-1 rounded-full border border-[var(--border)] px-2 py-1 text-xs text-[var(--foreground)]"
                        >
                          <Calendar
                            size={12}
                          />

                          {formatDate(
                            dueDate,
                          )}
                        </button>
                      ) : (
                        <span className="text-xs text-[var(--foreground-secondary)]">
                          No due date
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </section>

              <section className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm">
                <button
                  type="button"
                  onClick={() =>
                    setShowUpdates(
                      !showUpdates,
                    )
                  }
                  className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]"
                >
                  {showUpdates ? (
                    <ChevronDown
                      size={16}
                    />
                  ) : (
                    <ChevronRight
                      size={16}
                    />
                  )}

                  Updates
                </button>

                {showUpdates && (
                  <div className="mt-5">
                    <div className="flex gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                        <SignalHigh
                          size={14}
                          className="text-red-500"
                        />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">
                          Task
                        </p>

                        <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
                          Task details are ready to edit
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </aside>
          </div>
        </div>
      </div>

      {showAddSubtask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30">
          <div className="w-[480px] rounded-xl bg-[var(--surface)] p-6 text-[var(--foreground)] shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Add Subtask
              </h2>

              <button
                type="button"
                onClick={() =>
                  setShowAddSubtask(
                    false,
                  )
                }
                className="rounded-md p-1 hover:bg-[var(--surface-secondary)]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <input
                value={
                  newSubtaskTitle
                }
                onChange={(e) =>
                  setNewSubtaskTitle(
                    e.target.value,
                  )
                }
                placeholder="Subtask title"
                className="w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none"
              />

              <select
                value={
                  newSubtaskPriority
                }
                onChange={(e) =>
                  setNewSubtaskPriority(
                    e.target
                      .value as Priority,
                  )
                }
                className="w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none"
              >
                <option>
                  No Priority
                </option>

                <option>
                  Urgent
                </option>

                <option>
                  High
                </option>

                <option>
                  Medium
                </option>

                <option>
                  Low
                </option>
              </select>

              <select
                value={
                  newSubtaskStatus
                }
                onChange={(e) =>
                  setNewSubtaskStatus(
                    e.target
                      .value as TaskStatus,
                  )
                }
                className="w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none"
              >
                <option value="todo">
                  To Do
                </option>

                <option value="doing">
                  Doing
                </option>

                <option value="completed">
                  Completed
                </option>

                <option value="on_hold">
                  On Hold
                </option>
              </select>

              <input
                type="date"
                value={
                  newSubtaskDueDate
                }
                onChange={(e) =>
                  setNewSubtaskDueDate(
                    e.target.value,
                  )
                }
                className="w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  setShowAddSubtask(
                    false,
                  )
                }
                className="rounded-md border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--surface-secondary)]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  createSubtask
                }
                className="rounded-md bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)]"
              >
                Create Subtask
              </button>
            </div>
          </div>
        </div>
      )}

      {isDirty && (
        <div className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-end gap-3 border-t border-[var(--border)] bg-[var(--surface)] px-8 shadow-lg">
          <span className="mr-3 text-sm text-[var(--foreground-secondary)]">
            You have unsaved changes
          </span>

          <button
            type="button"
            onClick={() => {
              setIsDirty(false);
              setSaved(false);
            }}
            className="rounded-md border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-secondary)]"
          >
            Discard
          </button>

          <button
            type="button"
            onClick={saveChanges}
            className="rounded-md bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)]"
          >
            Save Changes
          </button>
        </div>
      )}

      {saved && (
        <div className="fixed bottom-5 right-5 z-50 rounded-md bg-[var(--foreground)] px-4 py-2 text-sm text-[var(--background)] shadow-lg">
          Changes saved
        </div>
      )}

      {showUnsavedModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30">
          <div className="w-[400px] rounded-xl bg-[var(--surface)] p-6 text-[var(--foreground)] shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Unsaved changes
                </h2>

                <p className="mt-2 text-sm leading-5 text-[var(--foreground-secondary)]">
                  You have made changes to this task. Do you want to save them before closing?
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowUnsavedModal(
                    false,
                  )
                }
                className="rounded-md p-1 text-[var(--foreground)] hover:bg-[var(--surface-secondary)]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowUnsavedModal(
                    false,
                  );

                  setIsDirty(false);

                  router.push(
                    "/tasks",
                  );
                }}
                className="rounded-md border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-secondary)]"
              >
                Discard
              </button>

              <button
                type="button"
                onClick={async () => {
                  await saveChanges();

                  setShowUnsavedModal(
                    false,
                  );

                  router.push(
                    "/tasks",
                  );
                }}
                className="rounded-md bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}