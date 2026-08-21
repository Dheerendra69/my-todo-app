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
import { useAuth } from "../auth/AuthContext";

type Priority = "Urgent" | "High" | "Medium" | "Low";

export type Project = {
    id: string;
    title: string;
    description: string;
    priority: Priority;
    lead: string;
    avatar?: string;
    dueDate: string;
};

type AddProjectModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (project: Project) => void;
};

const priorities: Priority[] = [
    "Urgent",
    "High",
    "Medium",
    "Low",
];

const priorityStyles = {
    Urgent: "text-[#DC2626]",
    High: "text-[#EF4444]",
    Medium: "text-[#F97316]",
    Low: "text-[#9CA3AF]",
};

export default function AddProjectModal({
    isOpen,
    onClose,
    onCreate,
}: AddProjectModalProps) {
    const { user } = useAuth();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [priority, setPriority] =
        useState<Priority>("Medium");

    const [lead, setLead] =
        useState("Admin");

    const [dueDate, setDueDate] =
        useState("");

    const [priorityOpen, setPriorityOpen] =
        useState(false);

    const [leadOpen, setLeadOpen] =
        useState(false);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    if (!isOpen) {
        return null;
    }

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setPriority("Medium");
        setLead("Admin");
        setDueDate("");
        setError("");
    };

    const handleSubmit = async () => {
        if (!title.trim() || !user?.id || isSubmitting) {
            return;
        }

        try {
            setIsSubmitting(true);
            setError("");

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/projects`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: title.trim(),
                        description: description.trim() || undefined,
                        priority,
                        dueDate: dueDate || undefined,
                        ownerId: user.id,
                    }),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to create project",
                );
            }

            onCreate({
                id: data.id,
                title: data.name,
                description:
                    data.description ?? "",
                priority,
                lead: user.name || lead,
                avatar: user.avatar ?? undefined,
                dueDate,
            });

            resetForm();
            onClose();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to create project",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

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
                            Add Project
                        </h2>

                        <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
                            Create a new project
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-[var(--surface-secondary)]"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="flex flex-col gap-4 p-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-[var(--foreground)]">
                            Project name
                        </label>

                        <input
                            value={title}
                            onChange={(event) =>
                                setTitle(event.target.value)
                            }
                            placeholder="Enter project name"
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
                            placeholder="Add a project description..."
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
                                            priorityStyles[priority]
                                        }
                                    >
                                        {priority === "Low" ? (
                                            <SignalLow size={14} />
                                        ) : (
                                            <SignalHigh size={14} />
                                        )}
                                    </span>

                                    <span className="flex-1 text-sm text-[var(--foreground)]">
                                        {priority}
                                    </span>

                                    <ChevronDown size={14} />
                                </button>

                                {priorityOpen && (
                                    <div className="absolute left-0 top-[42px] z-30 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-1 shadow-lg">
                                        {priorities.map((item) => (
                                            <button
                                                key={item}
                                                type="button"
                                                onClick={() => {
                                                    setPriority(item);
                                                    setPriorityOpen(false);
                                                }}
                                                className="flex h-9 w-full items-center gap-2 rounded-md px-2 hover:bg-[var(--surface-secondary)]"
                                            >
                                                <span
                                                    className={
                                                        priorityStyles[item]
                                                    }
                                                >
                                                    {item === "Low" ? (
                                                        <SignalLow size={14} />
                                                    ) : (
                                                        <SignalHigh size={14} />
                                                    )}
                                                </span>

                                                <span className="flex-1 text-left text-sm">
                                                    {item}
                                                </span>

                                                {priority === item && (
                                                    <Check size={14} />
                                                )}
                                            </button>
                                        ))}
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
                                    className="absolute left-3 top-1/2 -translate-y-1/2"
                                />

                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(event) =>
                                        setDueDate(event.target.value)
                                    }
                                    className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 pl-9 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-[var(--foreground)]">
                            Project Lead
                        </label>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() =>
                                    setLeadOpen(
                                        (current) => !current,
                                    )
                                }
                                className="flex h-9 w-full items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-left"
                            >
                                <img
                                    src={
                                        user?.avatar ||
                                        "/default-avatar.jpeg"
                                    }
                                    alt={user?.name || "User"}
                                    className="h-5 w-5 rounded-full object-cover"
                                />

                                <span className="flex-1 text-sm text-[var(--foreground)]">
                                    {user?.name || "User"}
                                </span>

                                <ChevronDown size={14} />
                            </button>

                            {leadOpen && (
                                <div className="absolute left-0 top-[42px] z-20 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-1 shadow-lg">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setLead(
                                                user?.name || "User",
                                            );
                                            setLeadOpen(false);
                                        }}
                                        className="flex h-9 w-full items-center gap-2 rounded-md px-2 hover:bg-[var(--surface-secondary)]"
                                    >
                                        <img
                                            src={
                                                user?.avatar ||
                                                "/default-avatar.jpeg"
                                            }
                                            alt={user?.name || "User"}
                                            className="h-5 w-5 rounded-full object-cover"
                                        />

                                        <span className="flex-1 text-left text-sm">
                                            {user?.name || "User"}
                                        </span>

                                        <Check size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {error && (
                        <p className="text-xs text-red-500">
                            {error}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] p-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="h-9 rounded-md px-3 text-sm font-medium hover:bg-[var(--surface-secondary)]"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        disabled={
                            !title.trim() ||
                            !user?.id ||
                            isSubmitting
                        }
                        onClick={handleSubmit}
                        className="flex h-9 items-center gap-1.5 rounded-md bg-[var(--foreground)] px-3 text-sm font-medium text-[var(--background)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Plus size={14} />

                        {isSubmitting
                            ? "Creating..."
                            : "Create Project"}
                    </button>
                </div>
            </div>
        </div>
    );
}