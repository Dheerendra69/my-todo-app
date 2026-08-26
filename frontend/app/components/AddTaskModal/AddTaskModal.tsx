"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    Calendar,
    Check,
    ChevronDown,
    Plus,
    Search,
    SignalHigh,
    SignalLow,
    Tag,
    UserPlus,
    X,
} from "lucide-react";

import { useAuth } from "../Auth/AuthContext";
import { toTitleCase } from "@/helpers";

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

type Status =
    | "To Do"
    | "Doing"
    | "Completed"
    | "On Hold";

type Label = {
    id?: string;
    name: string;
};

type Member = {
    id: string;
    name: string;
    email?: string | null;
    avatar?: string | null;
};

type CreatedTask = {
    id: string;
    title: string;
    description: string;
    priority: Priority;
    member: string;
    avatar?: string;
    members?: Member[];
    dueDate: string;
    dueDateValue: string | null;
    status: TaskStatus;
    labels: Label[];
};

type BackendCreatedTask = {
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
    assignee: {
        id: string;
        name: string;
        avatar?: string | null;
    } | null;
    members?: Member[];
    labels?: {
        id: string;
        name: string;
    }[];
};

type AddTaskModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (
        task: CreatedTask,
    ) => void;
    projectId: string;
    assigneeId?: string;
    defaultStatus: TaskStatus;
};

const priorities: Priority[] = [
    "No Priority",
    "Urgent",
    "High",
    "Medium",
    "Low",
];

const statuses: Status[] = [
    "To Do",
    "Doing",
    "Completed",
    "On Hold",
];

const priorityStyles = {
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

const priorityApiValues = {
    "No Priority": "no_priority",
    Urgent: "urgent",
    High: "high",
    Medium: "medium",
    Low: "low",
};

const priorityLabels = {
    no_priority: "No Priority",
    urgent: "Urgent",
    high: "High",
    medium: "Medium",
    low: "Low",
} as const;

const statusApiValues: Record<
    Status,
    TaskStatus
> = {
    "To Do": "todo",
    Doing: "doing",
    Completed: "completed",
    "On Hold": "on_hold",
};

const statusLabels: Record<
    TaskStatus,
    Status
> = {
    todo: "To Do",
    doing: "Doing",
    completed: "Completed",
    on_hold: "On Hold",
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

function getInitials(
    name: string,
) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(
            (part) =>
                part[0]?.toUpperCase(),
        )
        .join("");
}

export default function AddTaskModal({
    isOpen,
    onClose,
    onCreate,
    projectId,
    assigneeId,
    defaultStatus,
}: AddTaskModalProps) {
    const { user } =
        useAuth();

    const [title, setTitle] =
        useState("");

    const [
        description,
        setDescription,
    ] = useState("");

    const [
        priority,
        setPriority,
    ] = useState<Priority>(
        "No Priority",
    );

    const [
        availableMembers,
        setAvailableMembers,
    ] = useState<Member[]>([]);

    const [
        selectedMembers,
        setSelectedMembers,
    ] = useState<Member[]>([]);

    const [
        memberSearch,
        setMemberSearch,
    ] = useState("");

    const [
        membersLoading,
        setMembersLoading,
    ] = useState(false);

    const [
        membersError,
        setMembersError,
    ] = useState("");

    const [dueDate, setDueDate] =
        useState("");

    const [status, setStatus] =
        useState<Status>("To Do");

    const [
        labelInput,
        setLabelInput,
    ] = useState("");

    const [
        selectedLabels,
        setSelectedLabels,
    ] = useState<Label[]>([]);

    const [
        priorityOpen,
        setPriorityOpen,
    ] = useState(false);

    const [
        memberOpen,
        setMemberOpen,
    ] = useState(false);

    const [
        statusOpen,
        setStatusOpen,
    ] = useState(false);

    const [
        isSubmitting,
        setIsSubmitting,
    ] = useState(false);

    const [error, setError] =
        useState("");

    const isGuest =
        user?.isGuest === true;

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        setStatus(
            statusLabels[
            defaultStatus
            ],
        );

        setPriorityOpen(false);
        setMemberOpen(false);
        setStatusOpen(false);
        setMemberSearch("");

        if (isGuest) {
            return;
        }

        const fetchMembers =
            async () => {
                try {
                    setMembersLoading(true);
                    setMembersError("");

                    const response =
                        await fetch(
                            `${process.env.NEXT_PUBLIC_API_URL}/users`,
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
                                },
                            },
                        );

                    const data =
                        await response.json();

                    if (!response.ok) {
                        throw new Error(
                            data?.message ||
                            "Failed to load members",
                        );
                    }

                    setAvailableMembers(
                        Array.isArray(data)
                            ? data
                            : [],
                    );
                } catch (error) {
                    setMembersError(
                        error instanceof Error
                            ? error.message
                            : "Failed to load members",
                    );
                } finally {
                    setMembersLoading(false);
                }
            };

        fetchMembers();
    }, [
        isOpen,
        defaultStatus,
        isGuest,
    ]);

    if (!isOpen) {
        return null;
    }

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setPriority("No Priority");
        setSelectedMembers([]);
        setMemberSearch("");
        setDueDate("");
        setStatus(
            statusLabels[
            defaultStatus
            ],
        );
        setLabelInput("");
        setSelectedLabels([]);
        setPriorityOpen(false);
        setMemberOpen(false);
        setStatusOpen(false);
        setError("");
        setMembersError("");
    };

    const toggleMember = (
        memberToToggle: Member,
    ) => {
        setSelectedMembers(
            (current) => {
                const alreadySelected =
                    current.some(
                        (member) =>
                            member.id ===
                            memberToToggle.id,
                    );

                if (alreadySelected) {
                    return current.filter(
                        (member) =>
                            member.id !==
                            memberToToggle.id,
                    );
                }

                return [
                    ...current,
                    memberToToggle,
                ];
            },
        );
    };

    const removeMember = (
        memberId: string,
    ) => {
        setSelectedMembers(
            (current) =>
                current.filter(
                    (member) =>
                        member.id !==
                        memberId,
                ),
        );
    };

    const addLabel = () => {
        const trimmedLabel =
            labelInput.trim();

        if (!trimmedLabel) {
            return;
        }

        const formattedLabel =
            toTitleCase(
                trimmedLabel,
            );

        const alreadyExists =
            selectedLabels.some(
                (label) =>
                    label.name
                        .toLowerCase() ===
                    formattedLabel.toLowerCase(),
            );

        if (alreadyExists) {
            setLabelInput("");
            return;
        }

        setSelectedLabels(
            (current) => [
                ...current,
                {
                    name:
                        formattedLabel,
                },
            ],
        );

        setLabelInput("");
    };

    const removeLabel = (
        labelName: string,
    ) => {
        setSelectedLabels(
            (current) =>
                current.filter(
                    (label) =>
                        label.name !==
                        labelName,
                ),
        );
    };

    const handleLabelKeyDown = (
        event: React.KeyboardEvent<
            HTMLInputElement
        >,
    ) => {
        if (event.key === "Enter") {
            event.preventDefault();
            addLabel();
        }
    };

    const filteredMembers =
        availableMembers.filter(
            (member) => {
                const search =
                    memberSearch
                        .trim()
                        .toLowerCase();

                if (!search) {
                    return true;
                }

                return (
                    member.name
                        .toLowerCase()
                        .includes(search) ||
                    member.email
                        ?.toLowerCase()
                        .includes(search)
                );
            },
        );

    const handleSubmit = async () => {
        if (
            !title.trim() ||
            isSubmitting
        ) {
            return;
        }

        if (isGuest) {
            const guestMember: Member = {
                id:
                    user?.id ||
                    crypto.randomUUID(),
                name:
                    user?.name ||
                    "Guest",
                avatar:
                    user?.avatar ||
                    null,
            };

            const guestTask: CreatedTask = {
                id: crypto.randomUUID(),
                title:
                    toTitleCase(
                        title.trim(),
                    ),
                description:
                    description.trim(),
                priority,
                member:
                    user?.name ||
                    "Guest",
                avatar:
                    user?.avatar ||
                    undefined,
                members: [
                    guestMember,
                ],
                dueDate:
                    formatDueDate(
                        dueDate || null,
                    ),
                dueDateValue:
                    dueDate || null,
                status:
                    statusApiValues[
                    status
                    ],
                labels:
                    selectedLabels,
            };

            onCreate(
                guestTask,
            );

            resetForm();
            onClose();

            return;
        }

        if (!projectId) {
            setError(
                "Please create a project before creating a task.",
            );
            return;
        }

        try {
            setIsSubmitting(true);
            setError("");

            const response =
                await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/tasks`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                            Authorization:
                                `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
                        },
                        body: JSON.stringify({
                            title:
                                title.trim(),
                            description:
                                description.trim() ||
                                undefined,
                            priority:
                                priorityApiValues[
                                priority
                                ],
                            status:
                                statusApiValues[
                                status
                                ],
                            dueDate:
                                dueDate ||
                                undefined,
                            projectId,
                            assigneeId:
                                assigneeId ||
                                undefined,
                            memberIds:
                                selectedMembers.map(
                                    (member) =>
                                        member.id,
                                ),
                            labels:
                                selectedLabels.map(
                                    (label) =>
                                        label.name,
                                ),
                        }),
                    },
                );

            const data:
                BackendCreatedTask =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    (
                        data as unknown as {
                            message?: string | string[];
                        }
                    ).message
                        ? Array.isArray(
                            (
                                data as unknown as {
                                    message?: string | string[];
                                }
                            ).message,
                        )
                            ? (
                                data as unknown as {
                                    message: string[];
                                }
                            ).message.join(
                                ", ",
                            )
                            : (
                                data as unknown as {
                                    message: string;
                                }
                            ).message
                        : "Failed to create task",
                );
            }

            const createdMembers =
                data.members ??
                selectedMembers;

            onCreate({
                id: data.id,
                title: data.title,
                description:
                    data.description ??
                    "",
                priority:
                    priorityLabels[
                    data.priority
                    ],
                member:
                    data.assignee?.name ??
                    createdMembers[0]
                        ?.name ??
                    user?.name ??
                    "",
                avatar:
                    data.assignee?.avatar ??
                    createdMembers[0]
                        ?.avatar ??
                    undefined,
                members:
                    createdMembers,
                dueDate:
                    formatDueDate(
                        data.dueDate,
                    ),
                dueDateValue:
                    data.dueDate,
                status:
                    data.status,
                labels:
                    data.labels ??
                    selectedLabels,
            });

            resetForm();
            onClose();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to create task",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const priorityIcon =
        priority === "Low" ||
            priority === "No Priority" ? (
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
                        disabled={isSubmitting}
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
                                setTitle(
                                    event.target.value,
                                )
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
                                setDescription(
                                    event.target.value,
                                )
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
                                    onClick={() => {
                                        setPriorityOpen(
                                            (current) =>
                                                !current,
                                        );

                                        setMemberOpen(false);
                                        setStatusOpen(false);
                                    }}
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
                                                            "Low" ||
                                                            item ===
                                                            "No Priority" ? (
                                                            <SignalLow
                                                                size={14}
                                                            />
                                                        ) : (
                                                            <SignalHigh
                                                                size={14}
                                                            />
                                                        )}
                                                    </span>

                                                    <span className="flex-1 text-left text-sm">
                                                        {item}
                                                    </span>

                                                    {priority ===
                                                        item && (
                                                            <Check
                                                                size={14}
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
                                    className="absolute left-3 top-1/2 -translate-y-1/2"
                                />

                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(event) =>
                                        setDueDate(
                                            event.target.value,
                                        )
                                    }
                                    className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 pl-9 text-sm text-[var(--foreground)]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-[var(--foreground)]">
                            Members
                        </label>

                        {selectedMembers.length >
                            0 && (
                                <div className="flex flex-wrap gap-2">
                                    {selectedMembers.map(
                                        (member) => (
                                            <div
                                                key={
                                                    member.id
                                                }
                                                className="flex h-7 items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-secondary)] py-1 pl-1 pr-2 text-xs text-[var(--foreground)]"
                                            >
                                                {member.avatar ? (
                                                    <img
                                                        src={
                                                            member.avatar
                                                        }
                                                        alt={
                                                            member.name
                                                        }
                                                        className="h-5 w-5 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--foreground)] text-[9px] font-medium text-[var(--background)]">
                                                        {getInitials(
                                                            member.name,
                                                        )}
                                                    </div>
                                                )}

                                                <span className="max-w-[120px] truncate">
                                                    {
                                                        member.name
                                                    }
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeMember(
                                                            member.id,
                                                        )
                                                    }
                                                    className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-[var(--border)]"
                                                >
                                                    <X
                                                        size={11}
                                                    />
                                                </button>
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    if (isGuest) {
                                        return;
                                    }

                                    setMemberOpen(
                                        (current) =>
                                            !current,
                                    );

                                    setPriorityOpen(false);
                                    setStatusOpen(false);
                                }}
                                disabled={isGuest}
                                className="flex h-9 w-full items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-left disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <UserPlus
                                    size={14}
                                />

                                <span className="flex-1 text-sm text-[var(--foreground-secondary)]">
                                    {isGuest
                                        ? "Guest users cannot add members"
                                        : selectedMembers.length >
                                            0
                                            ? `${selectedMembers.length} member${selectedMembers.length === 1 ? "" : "s"} selected`
                                            : "Add members"}
                                </span>

                                {!isGuest && (
                                    <ChevronDown
                                        size={14}
                                    />
                                )}
                            </button>

                            {!isGuest &&
                                memberOpen && (
                                    <div className="absolute left-0 top-[42px] z-30 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-2 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                                        <div className="relative mb-2">
                                            <Search
                                                size={14}
                                                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--foreground-secondary)]"
                                            />

                                            <input
                                                autoFocus
                                                value={
                                                    memberSearch
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    setMemberSearch(
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                placeholder="Search members..."
                                                className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--background)] pl-8 pr-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--foreground-secondary)] focus:border-[var(--foreground-secondary)]"
                                            />
                                        </div>

                                        <div className="max-h-[220px] overflow-y-auto">
                                            {membersLoading && (
                                                <div className="flex h-16 items-center justify-center text-xs text-[var(--foreground-secondary)]">
                                                    Loading members...
                                                </div>
                                            )}

                                            {!membersLoading &&
                                                membersError && (
                                                    <div className="px-2 py-3 text-xs text-red-500">
                                                        {
                                                            membersError
                                                        }
                                                    </div>
                                                )}

                                            {!membersLoading &&
                                                !membersError &&
                                                filteredMembers.length ===
                                                0 && (
                                                    <div className="flex h-16 items-center justify-center text-xs text-[var(--foreground-secondary)]">
                                                        No members found
                                                    </div>
                                                )}

                                            {!membersLoading &&
                                                !membersError &&
                                                filteredMembers.map(
                                                    (
                                                        member,
                                                    ) => {
                                                        const isSelected =
                                                            selectedMembers.some(
                                                                (
                                                                    selected,
                                                                ) =>
                                                                    selected.id ===
                                                                    member.id,
                                                            );

                                                        return (
                                                            <button
                                                                key={
                                                                    member.id
                                                                }
                                                                type="button"
                                                                onClick={() =>
                                                                    toggleMember(
                                                                        member,
                                                                    )
                                                                }
                                                                className="flex min-h-10 w-full items-center gap-2 rounded-md px-2 py-1.5 hover:bg-[var(--surface-secondary)]"
                                                            >
                                                                {member.avatar ? (
                                                                    <img
                                                                        src={
                                                                            member.avatar
                                                                        }
                                                                        alt={
                                                                            member.name
                                                                        }
                                                                        className="h-6 w-6 rounded-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--foreground)] text-[10px] font-medium text-[var(--background)]">
                                                                        {getInitials(
                                                                            member.name,
                                                                        )}
                                                                    </div>
                                                                )}

                                                                <div className="min-w-0 flex-1 text-left">
                                                                    <p className="truncate text-sm text-[var(--foreground)]">
                                                                        {
                                                                            member.name
                                                                        }
                                                                    </p>

                                                                    {member.email && (
                                                                        <p className="truncate text-xs text-[var(--foreground-secondary)]">
                                                                            {
                                                                                member.email
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                <div className="flex h-4 w-4 items-center justify-center rounded border border-[var(--border)]">
                                                                    {isSelected && (
                                                                        <Check
                                                                            size={
                                                                                12
                                                                            }
                                                                        />
                                                                    )}
                                                                </div>
                                                            </button>
                                                        );
                                                    },
                                                )}
                                        </div>
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
                                onClick={() => {
                                    setStatusOpen(
                                        (current) =>
                                            !current,
                                    );

                                    setPriorityOpen(false);
                                    setMemberOpen(false);
                                }}
                                className="flex h-9 w-full items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-left"
                            >
                                <span className="flex-1 text-sm text-[var(--foreground)]">
                                    {status}
                                </span>

                                <ChevronDown
                                    size={14}
                                />
                            </button>

                            {statusOpen && (
                                <div className="absolute left-0 top-[42px] z-20 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-1 shadow-lg">
                                    {statuses.map(
                                        (item) => (
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
                                                <span className="flex-1 text-left text-sm text-[var(--foreground)]">
                                                    {item}
                                                </span>

                                                {status ===
                                                    item && (
                                                        <Check
                                                            size={14}
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
                            Labels
                        </label>

                        <input
                            value={labelInput}
                            onChange={(event) =>
                                setLabelInput(
                                    event.target.value,
                                )
                            }
                            onKeyDown={
                                handleLabelKeyDown
                            }
                            placeholder="Type a label and press Enter"
                            className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--foreground-secondary)] focus:border-[var(--foreground-secondary)]"
                        />

                        {selectedLabels.length >
                            0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {selectedLabels.map(
                                        (label) => (
                                            <div
                                                key={
                                                    label.name
                                                }
                                                className="flex h-5 items-center gap-1 rounded-3xl border border-white bg-[#F5F5F5] px-2 text-xs font-medium leading-4 text-[#171717]"
                                            >
                                                <Tag
                                                    size={12}
                                                />

                                                <span>
                                                    {
                                                        label.name
                                                    }
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeLabel(
                                                            label.name,
                                                        )
                                                    }
                                                    className="flex h-3 w-3 items-center justify-center rounded-full hover:opacity-70"
                                                >
                                                    <X
                                                        size={10}
                                                    />
                                                </button>
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}
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
                        className="h-9 rounded-md px-3 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-secondary)]"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        disabled={
                            !title.trim() ||
                            isSubmitting
                        }
                        onClick={handleSubmit}
                        className="flex h-9 items-center gap-1.5 rounded-md bg-[var(--foreground)] px-3 text-sm font-medium text-[var(--background)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Plus size={14} />

                        {isSubmitting
                            ? "Creating..."
                            : "Create Task"}
                    </button>
                </div>
            </div>
        </div>
    );
}