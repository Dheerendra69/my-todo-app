"use client";

import { useEffect, useState } from "react";
import {
    ChevronDown,
    Columns3,
    MoreHorizontal,
    Plus,
    SignalHigh,
    SignalLow,
} from "lucide-react";

import BoardActions from "../BoardActions/BoardActions";
import AddTaskModal from "../AddTaskModal/AddTaskModal";

import type { ViewMode } from "../FieldsPopover/FieldsPopOver";

import {
    type FilterState,
} from "../TaskFilter/TaskFilter";

import { useAuth } from "../auth/AuthContext";
import { useRouter } from "next/navigation";

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

const statusLabels: Record<
    TaskStatus,
    FilterState["status"][number]
> = {
    todo: "To Do",
    doing: "Doing",
    completed: "Completed",
    on_hold: "On Hold",
};

const priorityStyles: Record<
    Priority,
    {
        text: string;
    }
> = {
    "No Priority": {
        text: "text-[#9CA3AF]",
    },
    Urgent: {
        text: "text-[#DC2626]",
    },
    High: {
        text: "text-[#EF4444]",
    },
    Medium: {
        text: "text-[#F97316]",
    },
    Low: {
        text: "text-[#9CA3AF]",
    },
};

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
        dueDate: formatDueDate(
            task.dueDate,
        ),
        status: task.status,
    };
}

function PriorityBadge({
    priority,
}: {
    priority: Priority;
}) {
    return (
        <div
            className={`flex items-center gap-1 ${priorityStyles[priority].text}`}
        >
            {priority === "Low" ||
                priority === "No Priority" ? (
                <SignalLow
                    size={12}
                    strokeWidth={2}
                />
            ) : (
                <SignalHigh
                    size={12}
                    strokeWidth={2}
                />
            )}

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
                className="h-5 w-5 rounded-full object-cover"
            />
        );
    }

    return (
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--surface-secondary)] text-[10px] font-medium text-[var(--foreground)]">
            {member === "Unassigned"
                ? "?"
                : member.charAt(0)}
        </div>
    );
}

function TaskRow({
    task,
    onOpenTask,
}: {
    task: Task;
    onOpenTask: (
        taskId: string,
    ) => void;
}) {
    return (
        <div className="grid min-w-[780px] grid-cols-[minmax(240px,1fr)_140px_120px_140px_140px] items-center border-b border-[var(--border)] last:border-b-0">
            <button
                type="button"
                onClick={() =>
                    onOpenTask(task.id)
                }
                className="px-3 py-3 text-left text-sm font-medium text-[var(--foreground)] hover:underline"
            >
                {task.title}
            </button>

            <div className="px-3 py-3">
                <PriorityBadge
                    priority={task.priority}
                />
            </div>

            <div className="px-3 py-3">
                <MemberAvatar
                    member={task.member}
                    avatar={task.avatar}
                />
            </div>

            <div className="px-3 py-3 text-sm text-[var(--foreground)]">
                {task.dueDate || "-"}
            </div>

            <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-[var(--surface-secondary)]"
            >
                <MoreHorizontal
                    size={16}
                    strokeWidth={2}
                />
            </button>
        </div>
    );
}

function BoardTaskCard({
    task,
    onOpenTask,
}: {
    task: Task;
    onOpenTask: (
        taskId: string,
    ) => void;
}) {
    return (
        <button
            type="button"
            onClick={() =>
                onOpenTask(task.id)
            }
            className="mx-3 mb-3 block w-[calc(100%-24px)] rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-left"
        >
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium leading-5 text-[var(--foreground)]">
                    {task.title}
                </span>

                <span className="flex h-5 w-5 items-center justify-center">
                    <MoreHorizontal
                        size={14}
                        strokeWidth={2}
                    />
                </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <MemberAvatar
                        member={task.member}
                        avatar={task.avatar}
                    />

                    <span className="text-xs font-medium leading-4 text-[var(--foreground)]">
                        {task.member}
                    </span>
                </div>

                {task.dueDate && (
                    <div className="flex h-5 items-center gap-1 rounded-3xl bg-[#DC26261A] px-2 text-[#DC2626]">
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
        </button>
    );
}

function ListTaskSection({
    section,
    collapsed,
    onToggle,
    onAddTask,
    onOpenTask,
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
}) {
    return (
        <section>
            <div className="flex h-10 items-center gap-2">
                <button
                    type="button"
                    onClick={onToggle}
                    className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-[var(--surface-secondary)]"
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
                    <div className="w-full overflow-x-auto rounded-lg border border-[var(--border)]">
                        <div className="min-w-[780px]">
                            <div className="grid h-12 grid-cols-[minmax(240px,1fr)_140px_120px_140px_140px] items-center border-b border-[var(--border)] bg-[var(--surface-secondary)]">
                                <div className="px-3 text-sm font-medium text-[var(--foreground)]">
                                    Task
                                </div>

                                <div className="px-3 text-sm font-medium text-[var(--foreground)]">
                                    Priority
                                </div>

                                <div className="px-3 text-sm font-medium text-[var(--foreground)]">
                                    Members
                                </div>

                                <div className="px-3 text-sm font-medium text-[var(--foreground)]">
                                    Due Date
                                </div>

                                <div className="px-3 text-sm font-medium text-[var(--foreground)]">
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
                                    />
                                ),
                            )}

                            <button
                                type="button"
                                onClick={() =>
                                    onAddTask(section.id)
                                }
                                className="flex h-12 items-center gap-1 px-3 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-secondary)]"
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
}: {
    section: TaskSection;
    onAddTask: (
        sectionId: TaskStatus,
    ) => void;
    onOpenTask: (
        taskId: string,
    ) => void;
}) {
    return (
        <section className="h-fit w-[289px] shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)]">
            <div className="flex h-[39px] items-center justify-between px-3">
                <div className="flex items-center gap-2">
                    <Columns3
                        size={14}
                        strokeWidth={2}
                    />

                    <span className="text-xs font-semibold leading-[100%] text-[var(--foreground)]">
                        {section.title}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() =>
                            onAddTask(section.id)
                        }
                        className="flex h-5 w-5 items-center justify-center rounded-md hover:bg-[var(--background)]"
                    >
                        <Plus
                            size={14}
                            strokeWidth={2}
                        />
                    </button>

                    <button
                        type="button"
                        className="flex h-5 w-5 items-center justify-center rounded-md hover:bg-[var(--background)]"
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
                        />
                    ),
                )}
            </div>

            <div className="flex h-[39px] items-center px-3">
                <button
                    type="button"
                    onClick={() =>
                        onAddTask(section.id)
                    }
                    className="flex h-6 items-center gap-1 rounded-full px-2 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
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
    const { user } = useAuth();
    const router = useRouter();



    const [
        sections,
        setSections,
    ] = useState<TaskSection[]>(
        initialSections,
    );

    const [
        filters,
        setFilters,
    ] = useState<FilterState>(
        initialFilters,
    );

    const [
        viewMode,
        setViewMode,
    ] = useState<ViewMode>("list");

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

    useEffect(() => {
        const fetchTasks = async () => {
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

                setSections(
                    initialSections.map(
                        (section) => ({
                            ...section,
                            tasks: tasks
                                .filter(
                                    (task) =>
                                        task.status ===
                                        section.id,
                                )
                                .map(formatTask),
                        }),
                    ),
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

                    if (projects.length > 0) {
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

    const filteredSections =
        initialSections.map(
            (sectionDefinition) => {
                const section =
                    sections.find(
                        (item) =>
                            item.id ===
                            sectionDefinition.id,
                    ) ?? sectionDefinition;

                let filteredTasks =
                    section.tasks.filter(
                        (task) => {
                            const statusMatches =
                                filters.status.length ===
                                0 ||
                                filters.status.includes(
                                    statusLabels[
                                    task.status
                                    ],
                                );

                            const priorityMatches =
                                filters.priority
                                    .length === 0 ||
                                filters.priority.includes(
                                    task.priority,
                                );

                            return (
                                statusMatches &&
                                priorityMatches
                            );
                        },
                    );

                if (filters.dueDate) {
                    filteredTasks = [
                        ...filteredTasks,
                    ].sort((a, b) => {
                        const aDate =
                            a.dueDate
                                ? new Date(
                                    a.dueDate,
                                ).getTime()
                                : Number.MAX_SAFE_INTEGER;

                        const bDate =
                            b.dueDate
                                ? new Date(
                                    b.dueDate,
                                ).getTime()
                                : Number.MAX_SAFE_INTEGER;

                        return filters.dueDate ===
                            "Increasing"
                            ? aDate - bDate
                            : bDate - aDate;
                    });
                }

                return {
                    ...section,
                    tasks: filteredTasks,
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
        setSelectedSectionId(sectionId);
        setIsAddTaskOpen(true);
    };

    const closeAddTaskModal = () => {
        setIsAddTaskOpen(false);
        setSelectedSectionId(null);
    };

    const addTask = (
        task: Task,
    ) => {
        setSections(
            (currentSections) =>
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
                ),
        );
    };

    const addTaskToFirstSection =
        () => {
            openAddTaskModal("todo");
        };

    const openTask = (
        taskId: string,
    ) => {
        router.push(
            `/tasks/${taskId}`,
        );
    };

    return (
        <div className="min-w-0 min-h-screen w-full bg-[var(--background)]">
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
                        />
                    </div>

                    {viewMode === "list" ? (
                        <div className="flex w-full flex-col gap-5">
                            {filteredSections.map(
                                (section) => (
                                    <ListTaskSection
                                        key={section.id}
                                        section={section}
                                        collapsed={
                                            collapsedSections[
                                            section.id
                                            ] ?? false
                                        }
                                        onToggle={() =>
                                            toggleSection(
                                                section.id,
                                            )
                                        }
                                        onAddTask={
                                            openAddTaskModal
                                        }
                                        onOpenTask={(taskId) =>
                                            router.push(
                                                `/tasks/${taskId}`,
                                            )
                                        }
                                    />
                                ),
                            )}
                        </div>
                    ) : (
                        <div className="flex w-full items-start gap-4 overflow-x-auto pb-4">
                            {filteredSections.map(
                                (section) => (
                                    <BoardSection
                                        key={section.id}
                                        section={section}
                                        onAddTask={
                                            openAddTaskModal
                                        }
                                        onOpenTask={(taskId) =>
                                            router.push(
                                                `/tasks/${taskId}`,
                                            )
                                        }
                                    />
                                ),
                            )}
                        </div>
                    )}
                </div>
            </main>

            <button
                type="button"
                onClick={
                    addTaskToFirstSection
                }
                className="fixed bottom-6 right-6 flex h-10 items-center gap-2 rounded-full bg-[var(--background)] px-3 shadow-lg ring-1 ring-[#E5E5E5] md:hidden"
            >
                <Plus size={16} />

                <span className="text-xs font-medium">
                    Add Task
                </span>
            </button>

            <AddTaskModal
                isOpen={isAddTaskOpen}
                onClose={closeAddTaskModal}
                projectId={projectId}
                assigneeId={user?.id}
                defaultStatus={
                    selectedSectionId ??
                    "todo"
                }
                onCreate={(task) => {
                    addTask(task);
                    closeAddTaskModal();
                }}
            />
        </div>
    );
}