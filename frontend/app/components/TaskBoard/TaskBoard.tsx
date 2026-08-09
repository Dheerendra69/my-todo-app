"use client";

import { useState } from "react";
import {
    ChevronDown,
    ChevronRight,
    Columns3,
    Filter,
    MoreHorizontal,
    PanelLeft,
    Plus,
    Search,
    SignalHigh,
    SignalLow,
} from "lucide-react";
import TaskFilter from "../TaskFilter/TaskFilter";

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
                title: "Design Homepage",
                priority: "High",
                member: "Admin",
                avatar: "https://i.pravatar.cc/100?img=47",
                dueDate: "12 Sep 2026",
            },
            {
                id: 2,
                title: "Develop Login Feature",
                priority: "Low",
                member: "CN",
                dueDate: "15 Sep 2026",
            },
            {
                id: 3,
                title: "Test Payment Gateway",
                priority: "Medium",
                member: "+",
                dueDate: "18 Sep 2026",
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
                dueDate: "12 Sep 2026",
            },
            {
                id: 5,
                title: "Develop Login Feature",
                priority: "Low",
                member: "CN",
                dueDate: "15 Sep 2026",
            },
            {
                id: 6,
                title: "Test Payment Gateway",
                priority: "Medium",
                member: "+",
                dueDate: "18 Sep 2026",
            },
        ],
    },
    {
        id: "completed",
        title: "Completed",
        tasks: [
            {
                id: 7,
                title: "Design Homepage",
                priority: "High",
                member: "Admin",
                avatar: "https://i.pravatar.cc/100?img=47",
                dueDate: "12 Sep 2026",
            },
            {
                id: 8,
                title: "Develop Login Feature",
                priority: "Low",
                member: "CN",
                dueDate: "15 Sep 2026",
            },
            {
                id: 9,
                title: "Test Payment Gateway",
                priority: "Medium",
                member: "+",
                dueDate: "18 Sep 2026",
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

function PriorityBadge({ priority }: { priority: Priority }) {
    const styles = priorityStyles[priority];

    return (
        <div className={`flex items-center gap-1 ${styles.text}`}>
            {priority === "Low" ? (
                <SignalLow size={12} strokeWidth={2} className={styles.icon} />
            ) : (
                <SignalHigh size={12} strokeWidth={2} className={styles.icon} />
            )}

            <span className="text-xs font-medium leading-4">{priority}</span>
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
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F0F0F0] text-[10px] font-medium text-[#171717]">
            {member}
        </div>
    );
}

function TaskRow({ task }: { task: Task }) {
    return (
        <div className="grid min-w-[700px] grid-cols-[minmax(240px,1fr)_120px_120px_140px_48px] items-center border-b border-[#E5E5E5] last:border-b-0">
            <div className="px-3 py-3 text-sm font-medium text-[#171717]">
                {task.title}
            </div>

            <div className="px-3 py-3">
                <PriorityBadge priority={task.priority} />
            </div>

            <div className="px-3 py-3">
                <MemberAvatar member={task.member} avatar={task.avatar} />
            </div>

            <div className="px-3 py-3 text-sm text-[#171717]">
                {task.dueDate}
            </div>

            <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-[#F5F5F5]"
            >
                <MoreHorizontal size={16} strokeWidth={2} />
            </button>
        </div>
    );
}

function TaskSection({
    section,
    onAddTask,
}: {
    section: TaskSection;
    onAddTask: (sectionId: string) => void;
}) {
    return (
        <section className="w-full">
            <div className="mb-3 flex h-5 items-center gap-1">
                <button
                    type="button"
                    className="flex items-center justify-center"
                >
                    <ChevronDown size={16} strokeWidth={2} />
                </button>

                <span className="text-sm font-medium leading-5 text-[#171717]">
                    {section.title}
                </span>
            </div>

            <div className="w-full overflow-x-auto rounded-lg border border-[#E5E5E5]">
                <div className="min-w-[700px]">
                    <div className="grid grid-cols-[minmax(240px,1fr)_120px_120px_140px_48px] h-12 items-center border-b border-[#E5E5E5] bg-[#F5F5F5]">
                        <div className="px-3 text-sm font-medium text-[#171717]">
                            Task
                        </div>

                        <div className="px-3 text-sm font-medium text-[#171717]">
                            Priority
                        </div>

                        <div className="px-3 text-sm font-medium text-[#171717]">
                            Members
                        </div>

                        <div className="px-3 text-sm font-medium text-[#171717]">
                            Due Date
                        </div>

                        <div className="px-3 text-sm font-medium text-[#171717]">
                            Actions
                        </div>
                    </div>

                    {section.tasks.map((task) => (
                        <TaskRow key={task.id} task={task} />
                    ))}

                    <button
                        type="button"
                        onClick={() => onAddTask(section.id)}
                        className="flex h-12 items-center gap-1 px-3 text-sm font-medium text-[#171717] hover:bg-[#FAFAFA]"
                    >
                        <Plus size={16} strokeWidth={2} />
                        Add Task
                    </button>
                </div>
            </div>
        </section>
    );
}

function TopBar() {
    return (
        <header className="flex h-16 w-full items-center border-b border-[#E5E5E5] px-4">
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-[#F5F5F5]"
                >
                    <PanelLeft size={16} strokeWidth={2} />
                </button>

                <div className="h-[15px] w-px bg-[#E5E5E5]" />

                <nav className="flex items-center gap-2 text-sm">
                    <button
                        type="button"
                        className="text-[#737373] hover:text-[#171717]"
                    >
                        Projects
                    </button>

                    <ChevronRight
                        size={15}
                        strokeWidth={2}
                        className="text-[#737373]"
                    />

                    <span className="text-[#171717]">Design Homepage</span>
                </nav>
            </div>
        </header>
    );
}

function BoardActions() {
    return (
        <div className="flex items-center gap-2">
            <TaskFilter
                onChange={(filters) => {
                    console.log(filters);
                }}
            />

            <button
                type="button"
                className="flex h-8 items-center gap-1.5 rounded-md border border-[#E5E5E5] bg-white px-3 hover:bg-[#F5F5F5]"
            >
                <Columns3 size={15} strokeWidth={1.8} />
                <span className="text-xs font-medium text-[#171717]">Fields</span>
            </button>

            <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E5E5] bg-white hover:bg-[#F5F5F5]"
            >
                <Filter size={15} strokeWidth={2} />
            </button>

            <button
                type="button"
                className="flex h-8 items-center gap-1 rounded-md bg-[#171717] px-3 text-[#FAFAFA] hover:bg-[#262626]"
            >
                <Plus size={14} strokeWidth={2} />
                <span className="text-xs font-medium">Add Task</span>
            </button>
        </div>
    );
}

export default function TaskBoard() {
    const [sections, setSections] = useState<TaskSection[]>(initialSections);

    const addTask = (sectionId: string) => {
        setSections((currentSections) =>
            currentSections.map((section) => {
                if (section.id !== sectionId) {
                    return section;
                }

                const newTask: Task = {
                    id: Date.now(),
                    title: "New Task",
                    priority: "Medium",
                    member: "+",
                    dueDate: "18 Sep 2026",
                };

                return {
                    ...section,
                    tasks: [...section.tasks, newTask],
                };
            }),
        );
    };

    const addTaskToFirstSection = () => {
        addTask(sections[0].id);
    };

    return (
        <div className="min-h-screen w-full bg-white">
            <TopBar />

            <main className="w-full px-4 py-4">
                <div className="mx-auto w-full max-w-[992px]">
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <h1 className="text-base font-semibold leading-4 text-[#171717]">
                            Tasks
                        </h1>

                        <BoardActions />
                    </div>

                    <div className="flex w-full flex-col gap-5">
                        {sections.map((section) => (
                            <TaskSection
                                key={section.id}
                                section={section}
                                onAddTask={addTask}
                            />
                        ))}
                    </div>
                </div>
            </main>

            <button
                type="button"
                onClick={addTaskToFirstSection}
                className="fixed bottom-6 right-6 flex h-10 items-center gap-2 rounded-full bg-white px-3 shadow-lg ring-1 ring-[#E5E5E5] md:hidden"
            >
                <Plus size={16} />
                <span className="text-xs font-medium">Add Task</span>
            </button>
        </div>
    );
}