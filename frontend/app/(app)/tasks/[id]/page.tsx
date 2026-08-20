"use client";

import { useEffect, useState } from "react";
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
  Settings,
  Share2,
  SignalHigh,
  SignalLow,
  UserRound,
  X,
} from "lucide-react";

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
  assignee: {
    id: string;
    name: string;
    avatar?: string | null;
  } | null;
};

type Subtask = {
  id: number;
  title: string;
  priority: Priority;
  member?: string;
  dueDate: string;
};

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

const subtasks: Subtask[] = [
  {
    id: 1,
    title: "Subtask 1",
    priority: "High",
    member: "JD",
    dueDate: "12 Sep 2026",
  },
  {
    id: 2,
    title: "Subtask 2",
    priority: "Low",
    member: "CN",
    dueDate: "15 Sep 2026",
  },
  {
    id: 3,
    title: "Subtask 3",
    priority: "Medium",
    dueDate: "18 Sep 2026",
  },
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
      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      <Icon size={12} />

      {priority}
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

export default function TaskDetailsPage() {
  const params =
    useParams();

  const router =
    useRouter();

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
  ] = useState<
    BackendTask["assignee"]
  >(null);

  const [
    showDetails,
    setShowDetails,
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

  useEffect(() => {
    if (!taskId) {
      return;
    }

    const fetchTask =
      async () => {
        try {
          setIsLoading(true);

          const response =
            await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}`,
            );

          if (!response.ok) {
            throw new Error(
              "Failed to fetch task",
            );
          }

          const task:
            BackendTask =
            await response.json();

          setTitle(task.title);

          setDescription(
            task.description ?? "",
          );

          setStatus(task.status);

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
            `${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}`,
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
                          src={
                            assignee.avatar
                          }
                          alt={
                            assignee.name
                          }
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
                        <Calendar
                          size={12}
                        />

                        {formatDate(
                          dueDate,
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex min-h-7 items-center gap-3">
                  <span className="w-20 text-sm font-medium text-[var(--foreground-secondary)]">
                    Resources
                  </span>

                  <button
                    type="button"
                    className="flex h-7 items-center gap-1 rounded-full px-2 text-xs font-medium text-[var(--foreground-secondary)] hover:bg-[var(--surface-secondary)]"
                  >
                    <FileText
                      size={12}
                    />

                    Add document or link...
                  </button>
                </div>
              </div>

              <section className="mt-6">
                <div className="mb-3 flex items-center gap-1 text-sm font-medium text-[var(--foreground)]">
                  <ChevronDown
                    size={16}
                  />

                  Subtasks
                </div>

                <div className="overflow-hidden rounded-md border border-[var(--border)]">
                  <div className="grid grid-cols-[1.2fr_1fr_1fr_1.2fr_40px] border-b border-[var(--border)] text-sm font-medium text-[var(--foreground)]">
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

                  {subtasks.map(
                    (subtask) => (
                      <div
                        key={
                          subtask.id
                        }
                        className="grid h-11 grid-cols-[1.2fr_1fr_1fr_1.2fr_40px] items-center border-b border-[var(--border)] text-sm text-[var(--foreground)] last:border-b-0"
                      >
                        <button
                          type="button"
                          className="px-3 text-left hover:underline"
                        >
                          {
                            subtask.title
                          }
                        </button>

                        <div className="px-3">
                          <PriorityBadge
                            priority={
                              subtask.priority
                            }
                          />
                        </div>

                        <div className="px-3">
                          {subtask.member ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--surface-secondary)] text-[10px] text-[var(--foreground)]">
                              {
                                subtask.member
                              }
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--surface-secondary)] text-[var(--foreground)]"
                            >
                              <Plus
                                size={12}
                              />
                            </button>
                          )}
                        </div>

                        <div className="px-3 text-sm">
                          {
                            subtask.dueDate
                          }
                        </div>

                        <button
                          type="button"
                          className="px-2"
                        >
                          <MoreHorizontal
                            size={16}
                          />
                        </button>
                      </div>
                    ),
                  )}

                  <button
                    type="button"
                    className="flex h-11 items-center gap-2 px-3 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface-secondary)]"
                  >
                    <Plus size={15} />

                    Add Subtasks
                  </button>
                </div>
              </section>

              <section className="mt-6">
                <h3 className="mb-3 text-sm font-medium text-[var(--foreground)]">
                  Comments
                </h3>

                <div className="flex h-16 items-center justify-between rounded-md border border-[var(--border)] px-4">
                  <span className="text-sm text-[var(--foreground-secondary)]">
                    Add a comment...
                  </span>

                  <div className="flex items-center gap-4 text-[var(--foreground)]">
                    <FileText
                      size={16}
                    />

                    <SendHorizontal
                      size={16}
                    />
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

                    <Settings
                      size={16}
                    />
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