"use client";

import { useState } from "react";
import {
    Calendar,
    Check,
    ChevronDown,
    Plus,
    SignalHigh,
    SignalLow,
    X,
} from "lucide-react";

type Priority = "High" | "Medium" | "Low";

type AddTaskModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (task: {
        id: number | string;
        title: string;
        description: string;
        priority: Priority;
        member: string;
        dueDate: string;
        status: string;
    }) => void;
};

const priorities: Priority[] = [
    "High",
    "Medium",
    "Low",
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

export default function AddTaskModal({
    isOpen,
    onClose,
    onCreate,
}: AddTaskModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] =
        useState<Priority>("Medium");
    const [member, setMember] = useState("Admin");
    const [dueDate, setDueDate] = useState("");
    const [status, setStatus] = useState("To Do");

    const [priorityOpen, setPriorityOpen] =
        useState(false);
    const [memberOpen, setMemberOpen] =
        useState(false);
    const [statusOpen, setStatusOpen] =
        useState(false);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = () => {
        if (!title.trim()) {
            return;
        }

        onCreate({
            id: Date.now(),
            title: title.trim(),
            description: description.trim(),
            priority,
            member,
            dueDate,
            status,
        });

        setTitle("");
        setDescription("");
        setPriority("Medium");
        setMember("Admin");
        setDueDate("");
        setStatus("To Do");

        onClose();
    };

    const priorityIcon =
        priority === "Low" ? (
            <SignalLow size={14} />
        ) : (
            <SignalHigh size={14} />
        );

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4"
            onMouseDown={onClose}
        >
            <div
                className="w-full max-w-[520px] overflow-visible rounded-xl border border-[var(--border)] bg-[var(--background)] shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
                onMouseDown={(event) =>
                    event.stopPropagation()
                }
            >
                <div className="flex h-[64px] items-center justify-between border-b border-[var(--border)] px-5">
                    <div>
                        <h2 className="text-sm font-semibold text-[var(--foreground)]">
                            Add Task
                        </h2>

                        <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
                            Create a new task
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-[var(--surface-secondary)]"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="flex flex-col gap-4 p-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-[var(--foreground)]">
                            Task title
                        </label>

                        <input
                            value={title}
                            onChange={(event) =>
                                setTitle(event.target.value)
                            }
                            placeholder="What needs to be done?"
                            className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--foreground-secondary)] focus:border-[var(--foreground-secondary)]"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-[var(--foreground)]">
                            Description
                        </label>

                        <textarea
                            value={description}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                            placeholder="Add a description..."
                            rows={3}
                            className="w-full resize-none rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--foreground-secondary)] focus:border-[var(--foreground-secondary)]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-[var(--foreground)]">
                                Priority
                            </label>

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setPriorityOpen(
                                            (current) =>
                                                !current,
                                        )
                                    }
                                    className="flex h-9 w-full items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-left"
                                >
                                    <span
                                        className={
                                            priorityStyles[
                                                priority
                                            ].text
                                        }
                                    >
                                        {priorityIcon}
                                    </span>

                                    <span className="flex-1 text-sm text-[var(--foreground)]">
                                        {priority}
                                    </span>

                                    <ChevronDown
                                        size={14}
                                        className="text-[var(--foreground-secondary)]"
                                    />
                                </button>

                                {priorityOpen && (
                                    <div className="absolute left-0 top-[42px] z-20 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-1 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                                        {priorities.map(
                                            (item) => (
                                                <button
                                                    key={item}
                                                    type="button"
                                                    onClick={() => {
                                                        setPriority(
                                                            item,
                                                        );
                                                        setPriorityOpen(
                                                            false,
                                                        );
                                                    }}
                                                    className="flex h-9 w-full items-center gap-2 rounded-md px-2 hover:bg-[var(--surface-secondary)]"
                                                >
                                                    <span
                                                        className={
                                                            priorityStyles[
                                                                item
                                                            ].text
                                                        }
                                                    >
                                                        {item ===
                                                            "Low" ? (
                                                            <SignalLow
                                                                size={
                                                                    14
                                                                }
                                                            />
                                                        ) : (
                                                            <SignalHigh
                                                                size={
                                                                    14
                                                                }
                                                            />
                                                        )}
                                                    </span>

                                                    <span className="flex-1 text-left text-sm">
                                                        {item}
                                                    </span>

                                                    {priority ===
                                                        item && (
                                                            <Check
                                                                size={
                                                                    14
                                                                }
                                                            />
                                                        )}
                                                </button>
                                            ),
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-[var(--foreground)]">
                                Due Date
                            </label>

                            <div className="relative">
                                <Calendar
                                    size={14}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-secondary)]"
                                />

                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(event) =>
                                        setDueDate(
                                            event.target.value,
                                        )
                                    }
                                    className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 pl-9 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground-secondary)]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-[var(--foreground)]">
                            Assignee
                        </label>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() =>
                                    setMemberOpen(
                                        (current) =>
                                            !current,
                                    )
                                }
                                className="flex h-9 w-full items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-left"
                            >
                                <div className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-secondary)]">
                                    <img
                                        src="https://i.pravatar.cc/100?img=47"
                                        alt="Admin"
                                        className="h-full w-full object-cover"
                                    />
                                </div>

                                <span className="flex-1 text-sm text-[var(--foreground)]">
                                    {member}
                                </span>

                                <ChevronDown
                                    size={14}
                                    className="text-[var(--foreground-secondary)]"
                                />
                            </button>

                            {memberOpen && (
                                <div className="absolute left-0 top-[42px] z-20 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-1 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMember("Admin");
                                            setMemberOpen(
                                                false,
                                            );
                                        }}
                                        className="flex h-9 w-full items-center gap-2 rounded-md px-2 hover:bg-[var(--surface-secondary)]"
                                    >
                                        <div className="h-5 w-5 overflow-hidden rounded-full">
                                            <img
                                                src="https://i.pravatar.cc/100?img=47"
                                                alt="Admin"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        <span className="flex-1 text-left text-sm">
                                            Admin
                                        </span>

                                        {member === "Admin" && (
                                            <Check
                                                size={14}
                                            />
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-[var(--foreground)]">
                            Status
                        </label>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() =>
                                    setStatusOpen(
                                        (current) =>
                                            !current,
                                    )
                                }
                                className="flex h-9 w-full items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-left"
                            >
                                <span className="flex-1 text-sm text-[var(--foreground)]">
                                    {status}
                                </span>

                                <ChevronDown
                                    size={14}
                                    className="text-[var(--foreground-secondary)]"
                                />
                            </button>

                            {statusOpen && (
                                <div className="absolute left-0 top-[42px] z-20 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-1 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                                    {[
                                        "To Do",
                                        "Doing",
                                        "Completed",
                                        "On Hold",
                                    ].map((item) => (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => {
                                                setStatus(
                                                    item,
                                                );
                                                setStatusOpen(
                                                    false,
                                                );
                                            }}
                                            className="flex h-9 w-full items-center rounded-md px-2 hover:bg-[var(--surface-secondary)]"
                                        >
                                            <span className="flex-1 text-left text-sm">
                                                {item}
                                            </span>

                                            {status ===
                                                item && (
                                                    <Check
                                                        size={14}
                                                    />
                                                )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] p-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-9 rounded-md px-3 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-secondary)]"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        disabled={!title.trim()}
                        onClick={handleSubmit}
                        className="flex h-9 items-center gap-1.5 rounded-md bg-[var(--foreground)] px-3 text-sm font-medium text-[var(--background)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Plus size={14} />
                        Create Task
                    </button>
                </div>
            </div>
        </div>
    );
}