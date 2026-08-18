"use client";

import { useState } from "react";
import {
    Calendar,
    ChevronDown,
    Columns3,
    GripVertical,
    MoreHorizontal,
    Plus,
    SignalHigh,
    SignalLow,
    Tag,
} from "lucide-react";
import BoardActions from "../BoardActions/BoardActions";
import AddTaskModal from "../AddTaskModal/AddTaskModal";
import type { ViewMode } from "../FieldsPopover/FieldsPopOver";

type Priority = "High" | "Medium" | "Low";

type Task = {
    id: number;
    title: string;
    priority: Priority;
    member: string;
    avatar?: string;
    dueDate: string;
};

type TaskSection = {
    id: string;
    title: string;
    tasks: Task[];
};

const initialSections: TaskSection[] = [
    {
        id: "todo",
        title: "To Do",
        tasks: [
            {
                id: 1,
                title: "Write API Documentation",
                priority: "High",
                member: "Admin",
                avatar: "https://i.pravatar.cc/100?img=47",
                dueDate: "29 Jul",
            },
            {
                id: 2,
                title: "Implement Search Function",
                priority: "Low",
                member: "Admin",
                avatar: "https://i.pravatar.cc/100?img=47",
                dueDate: "29 Jul",
            },
            {
                id: 3,
                title: "Deploy to Production",
                priority: "Medium",
                member: "Admin",
                avatar: "https://i.pravatar.cc/100?img=47",
                dueDate: "29 Jul",
            },
        ],
    },
    {
        id: "doing",
        title: "Doing",
        tasks: [
            {
                id: 4,
                title: "Design Homepage",
                priority: "High",
                member: "Admin",
                avatar: "https://i.pravatar.cc/100?img=47",
                dueDate: "29 Jul",
            },
            {
                id: 5,
                title: "Develop Login Feature",
                priority: "Low",
                member: "Admin",
                avatar: "https://i.pravatar.cc/100?img=47",
                dueDate: "29 Jul",
            },
        ],
    },

    {
        id: "completed",
        title: "Completed",
        tasks: [
            {
                id: 8,
                title: "Test Payment Gateway",
                priority: "Medium",
                member: "Admin",
                avatar: "https://i.pravatar.cc/100?img=47",
                dueDate: "29 Jul",
            },
        ],
    },
    {
        id: "onhold",
        title: "On Hold",
        tasks: [
            {
                id: 6,
                title: "Review Pending Requirements",
                priority: "Medium",
                member: "Admin",
                avatar: "https://i.pravatar.cc/100?img=47",
                dueDate: "29 Jul",
            },
            {
                id: 7,
                title: "Waiting for Client Approval",
                priority: "Low",
                member: "Admin",
                avatar: "https://i.pravatar.cc/100?img=47",
                dueDate: "30 Jul",
            },
        ],
    },
];

const priorityStyles = {
    High: {
        text: "text-[#EF4444]",
        icon: "text-[#EF4444]",
    },
    Medium: {
        text: "text-[#F97316]",
        icon: "text-[#F97316]",
    },
    Low: {
        text: "text-[#9CA3AF]",
        icon: "text-[#9CA3AF]",
    },
};

function PriorityBadge({
    priority,
}: {
    priority: Priority;
}) {
    const styles = priorityStyles[priority];

    return (
        <div className={`flex items-center gap-1 ${styles.text}`}>
            {priority === "Low" ? (
                <SignalLow size={12} strokeWidth={2} />
            ) : (
                <SignalHigh size={12} strokeWidth={2} />
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
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F0F0F0] text-[10px] font-medium">
            {member}
        </div>
    );
}

function TaskRow({ task }: { task: Task }) {
    return (
        <div className="grid min-w-[780px] grid-cols-[minmax(240px,1fr)_140px_120px_140px_140px] items-center border-b border-[var(--border)] last:border-b-0">
            <div className="px-3 py-3 text-sm font-medium text-[var(--foreground)]">
                {task.title}
            </div>

            <div className="px-3 py-3">
                <PriorityBadge priority={task.priority} />
            </div>

            <div className="px-3 py-3">
                <MemberAvatar
                    member={task.member}
                    avatar={task.avatar}
                />
            </div>

            <div className="px-3 py-3 text-sm text-[var(--foreground)]">
                {task.dueDate}
            </div>

            <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-[var(--surface-secondary)]"
            >
                <MoreHorizontal size={16} strokeWidth={2} />
            </button>
        </div>
    );
}

function BoardTaskCard({ task }: { task: Task }) {
    return (
        <div className="mx-3 mb-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium leading-5 text-[#0A0A0A]">
                    {task.title}
                </span>

                <button
                    type="button"
                    className="flex h-5 w-5 items-center justify-center"
                >
                    <MoreHorizontal size={14} strokeWidth={2} />
                </button>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <MemberAvatar
                        member={task.member}
                        avatar={task.avatar}
                    />

                    <span className="text-xs font-medium leading-4 text-[#0A0A0A]">
                        {task.member === "Admin"
                            ? "Admin"
                            : task.member}
                    </span>
                </div>

                <div className="flex h-5 items-center gap-1 rounded-3xl bg-[#DC26261A] px-2 text-[#DC2626]">
                    <span className="text-xs font-medium leading-4">
                        {task.dueDate.replace("2026", "")}
                    </span>
                </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
                <div className="flex h-5 items-center gap-1 rounded-3xl bg-[var(--surface-secondary)] px-2">
                    <span className="text-xs font-medium leading-4 text-[var(--foreground)]">
                        Deployment
                    </span>
                </div>

                <div className="flex h-5 items-center gap-1 rounded-3xl bg-[var(--surface-secondary)] px-2">
                    <span className="text-xs font-medium leading-4 text-[var(--foreground)]">
                        Deployment
                    </span>
                </div>
            </div>
        </div>
    );
}

function ListTaskSection({
    section,
    collapsed,
    onToggle,
    onAddTask,
}: {
    section: TaskSection;
    collapsed: boolean;
    onToggle: () => void;
    onAddTask: (sectionId: string) => void;
}) {
    return (
        <section className="w-full">
            <div className="mb-3 flex h-5 items-center gap-1">
                <button
                    type="button"
                    onClick={onToggle}
                    className="flex h-5 w-5 items-center justify-center rounded hover:bg-[var(--surface-secondary)]"
                >
                    <ChevronDown
                        size={16}
                        strokeWidth={2}
                        className={`
              transition-transform duration-500 ease-in-out
              ${collapsed ? "-rotate-90" : ""}
            `}
                    />
                </button>

                <span className="text-sm font-medium leading-5 text-[var(--foreground)]">
                    {section.title}
                </span>
            </div>

            <div
                className={`
          grid transition-[grid-template-rows,opacity]
          duration-500 ease-in-out
          ${collapsed
                        ? "grid-rows-[0fr] opacity-0"
                        : "grid-rows-[1fr] opacity-100"
                    }
        `}
            >
                <div className="min-h-0 overflow-hidden">
                    <div className="w-full overflow-x-auto rounded-lg border border-[var(--border)]">
                        <div className="min-w-[780px]">
                            <div className="grid h-12 grid-cols-[minmax(240px,1fr)_120px_120px_140px_160px] items-center border-b border-[var(--border)] bg-[var(--surface-secondary)]">
                                <div className="px-3 text-sm font-medium">
                                    Task
                                </div>

                                <div className="px-3 text-sm font-medium">
                                    Priority
                                </div>

                                <div className="px-3 text-sm font-medium">
                                    Members
                                </div>

                                <div className="px-3 text-sm font-medium">
                                    Due Date
                                </div>

                                <div className="px-3 text-sm font-medium">
                                    Actions
                                </div>
                            </div>

                            {section.tasks.map((task) => (
                                <TaskRow
                                    key={task.id}
                                    task={task}
                                />
                            ))}

                            <button
                                type="button"
                                onClick={() => onAddTask(section.id)}
                                className="flex h-12 items-center gap-1 px-3 text-sm font-medium hover:bg-[var(--surface)]"
                            >
                                <Plus size={16} />
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
}: {
    section: TaskSection;
    onAddTask: (sectionId: string) => void;
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
                        onClick={() => onAddTask(section.id)}
                        className="flex h-5 w-5 items-center justify-center rounded-md hover:bg-[#E5E5E5]"
                    >
                        <Plus size={14} strokeWidth={2} />
                    </button>

                    <button
                        type="button"
                        className="flex h-5 w-5 items-center justify-center rounded-md hover:bg-[#E5E5E5]"
                    >
                        <MoreHorizontal
                            size={14}
                            strokeWidth={2}
                        />
                    </button>
                </div>
            </div>

            <div>
                {section.tasks.map((task) => (
                    <BoardTaskCard
                        key={task.id}
                        task={task}
                    />
                ))}
            </div>

            <div className="flex h-[39px] items-center px-3">
                <button
                    type="button"
                    onClick={() => onAddTask(section.id)}
                    className="flex h-6 items-center gap-1 rounded-full px-2 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
                >
                    <Plus size={12} strokeWidth={2} />
                    <span>Add Task</span>
                </button>
            </div>
        </section>
    );
}

export default function TaskBoard() {

    const [sections, setSections] =
        useState<TaskSection[]>(initialSections);

    const [viewMode, setViewMode] =
        useState<ViewMode>("list");

    const [collapsedSections, setCollapsedSections] =
        useState<Record<string, boolean>>({});

    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

    const toggleSection = (sectionId: string) => {
        setCollapsedSections((current) => ({
            ...current,
            [sectionId]: !current[sectionId],
        }));
    };

    const addTask = (sectionId: string, task: Task) => {
        setSections((currentSections) =>
            currentSections.map((section) => {
                if (section.id !== sectionId) {
                    return section;
                }

                return {
                    ...section,
                    tasks: [...section.tasks, task],
                };
            }),
        );
    };

    // const addTaskToFirstSection = () => {
    //     addTask(sections[0].id);
    // };

    const addTaskToFirstSection = () => {
        setSelectedSectionId(sections[0].id);
        setIsAddTaskOpen(true);
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
                            onViewModeChange={setViewMode}
                            addButtonLabel="Add Task"
                            onAdd={addTaskToFirstSection}
                        />
                    </div>

                    {viewMode === "list" ? (
                        <div className="flex w-full flex-col gap-5">
                            {sections.map((section) => (
                                <ListTaskSection
                                    key={section.id}
                                    section={section}
                                    collapsed={
                                        collapsedSections[section.id] ?? false
                                    }
                                    onToggle={() =>
                                        toggleSection(section.id)
                                    }
                                    onAddTask={(sectionId) => {
                                        setSelectedSectionId(sectionId);
                                        setIsAddTaskOpen(true);
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex w-full items-start gap-4 overflow-x-auto pb-4">
                            {sections.map((section) => (
                                <BoardSection
                                    key={section.id}
                                    section={section}
                                    collapsed={
                                        collapsedSections[section.id] ?? false
                                    }
                                    onToggle={() =>
                                        toggleSection(section.id)
                                    }
                                    onAddTask={(sectionId) => {
                                        setSelectedSectionId(sectionId);
                                        setIsAddTaskOpen(true);
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <button
                type="button"
                onClick={addTaskToFirstSection}
                className="fixed bottom-6 right-6 flex h-10 items-center gap-2 rounded-full bg-[var(--background)] px-3 shadow-lg ring-1 ring-[#E5E5E5] md:hidden"
            >
                <Plus size={16} />
                <span className="text-xs font-medium">
                    Add Task
                </span>
            </button>

            <AddTaskModal
                isOpen={isAddTaskOpen}
                onClose={() => {
                    setIsAddTaskOpen(false);
                    setSelectedSectionId(null);
                }}
                onCreate={(task) => {
                    if (!selectedSectionId) return;

                    addTask(selectedSectionId, task);

                    setIsAddTaskOpen(false);
                    setSelectedSectionId(null);
                }}
            />
        </div>
    );
}