"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Eye,
  FileText,
  Gear,
  Lock,
  MoreHorizontal,
  Plus,
  SendHorizontal,
  Settings,
  Share2,
  SignalHigh,
  SignalLow,
  SmilePlus,
  Tag,
  UserRound,
  X,
} from "lucide-react";

type Priority = "No Priority" | "Urgent" | "High" | "Medium" | "Low";

type Subtask = {
  id: number;
  title: string;
  priority: Priority;
  member?: string;
  dueDate: string;
};

const priorityConfig: Record<
  Priority,
  { icon: typeof SignalHigh; className: string }
> = {
  "No Priority": {
    icon: Circle,
    className: "text-neutral-400",
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
  const config = priorityConfig[priority];
  const Icon = config.icon;

  return (
    <div
      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      <Icon size={12} />
      {priority}
    </div>
  );
}

export default function TaskDetailsPage() {
  const [title, setTitle] = useState("Write API Documentation");
  const [description, setDescription] = useState(
    "Create clear and detailed API documentation to guide developers in using the inventory and sales metrics features effectively."
  );

  const [status, setStatus] = useState("Backlog");
  const [priority, setPriority] = useState<Priority>("High");

  const [labels, setLabels] = useState([
    "Research",
    "Design",
    "Development",
    "Testing",
    "Deployment",
  ]);

  const [showDetails, setShowDetails] = useState(true);
  const [showUpdates, setShowUpdates] = useState(true);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);

  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  const updateField = (callback: () => void) => {
    callback();
    setIsDirty(true);
    setSaved(false);
  };

  const saveChanges = async () => {
    try {
      const payload = {
        title,
        description,
        status,
        priority,
        labels,
      };

      console.log("PUT /tasks/:id", payload);

      setIsDirty(false);
      setSaved(true);
    } catch (error) {
      console.error(error);
    }
  };

  const closeTask = () => {
    if (isDirty) {
      setShowUnsavedModal(true);
      return;
    }

    console.log("Close task");
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <div className="border-l border-neutral-200">
        {/* Top Bar */}
        <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-6">
          <button className="rounded-md p-2 hover:bg-neutral-100">
            <span className="text-lg">▣</span>
          </button>

          <div className="flex items-center gap-2">
            <button className="flex h-8 items-center gap-2 rounded-md border border-neutral-200 px-3 hover:bg-neutral-50">
              <Lock size={14} />
            </button>

            <button className="flex h-8 items-center gap-1.5 rounded-md border border-neutral-200 px-3 text-xs text-indigo-500 hover:bg-neutral-50">
              <Eye size={14} />
              1
            </button>

            <button className="flex h-8 items-center rounded-md border border-neutral-200 px-3 hover:bg-neutral-50">
              <Share2 size={14} />
            </button>

            <button
              onClick={closeTask}
              className="flex h-8 items-center rounded-md border border-neutral-200 bg-neutral-100 px-3 opacity-70 hover:bg-neutral-200"
            >
              <MoreHorizontal size={15} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mx-auto flex max-w-[976px] gap-5">
            {/* Main */}
            <main className="min-w-0 flex-1">
              {/* Heading */}
              <div className="flex min-h-[78px] items-start justify-between gap-5">
                <div className="min-w-0">
                  <input
                    value={title}
                    onChange={(e) =>
                      updateField(() => setTitle(e.target.value))
                    }
                    className="w-full bg-transparent text-2xl font-semibold tracking-[-0.4px] outline-none"
                  />

                  <textarea
                    value={description}
                    onChange={(e) =>
                      updateField(() => setDescription(e.target.value))
                    }
                    rows={2}
                    className="mt-1 w-full resize-none bg-transparent text-sm leading-5 text-neutral-500 outline-none"
                  />
                </div>
              </div>

              {/* Properties */}
              <div className="space-y-2">
                <div className="flex min-h-7 items-center gap-3">
                  <span className="w-20 text-sm font-medium text-neutral-500">
                    Properties
                  </span>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-xs">
                        A
                      </span>
                      <span className="text-sm font-medium">Designer</span>
                    </div>

                    <button className="flex h-5 items-center gap-1 rounded-full bg-red-100 px-2 text-xs font-medium text-red-600">
                      <Calendar size={12} />
                      31 Jul
                    </button>
                  </div>
                </div>

                {/* Labels */}
                <div className="flex min-h-7 items-center gap-3">
                  <span className="w-20 text-sm font-medium text-neutral-500">
                    Labels
                  </span>

                  <div className="flex flex-wrap gap-1.5">
                    {labels.map((label) => (
                      <button
                        key={label}
                        className="flex h-5 items-center gap-1 rounded-full bg-neutral-100 px-2 text-xs font-medium"
                      >
                        <Tag size={12} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resources */}
                <div className="flex min-h-7 items-center gap-3">
                  <span className="w-20 text-sm font-medium text-neutral-500">
                    Resources
                  </span>

                  <button className="flex h-7 items-center gap-1 rounded-full px-2 text-xs font-medium text-neutral-500 hover:bg-neutral-100">
                    <FileText size={12} />
                    Add document or link...
                  </button>
                </div>
              </div>

              {/* Subtasks */}
              <section className="mt-6">
                <div className="mb-3 flex items-center gap-1 text-sm font-medium">
                  <ChevronDown size={16} />
                  Subtasks
                </div>

                <div className="overflow-hidden rounded-md border border-neutral-200">
                  <div className="grid grid-cols-[1.2fr_1fr_1fr_1.2fr_40px] border-b border-neutral-200 text-sm font-medium">
                    <div className="px-3 py-4">Task</div>
                    <div className="px-3 py-4">Priority</div>
                    <div className="px-3 py-4">Members</div>
                    <div className="px-3 py-4">Due Date</div>
                    <div className="px-2 py-4">Actions</div>
                  </div>

                  {subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="grid h-11 grid-cols-[1.2fr_1fr_1fr_1.2fr_40px] items-center border-b border-neutral-200 text-sm last:border-b-0"
                    >
                      <button className="px-3 text-left hover:underline">
                        {subtask.title}
                      </button>

                      <div className="px-3">
                        <PriorityBadge priority={subtask.priority} />
                      </div>

                      <div className="px-3">
                        {subtask.member ? (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100 text-[10px]">
                            {subtask.member}
                          </span>
                        ) : (
                          <button className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100">
                            <Plus size={12} />
                          </button>
                        )}
                      </div>

                      <div className="px-3 text-sm">
                        {subtask.dueDate}
                      </div>

                      <button className="px-2">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  ))}

                  <button className="flex h-11 items-center gap-2 px-3 text-xs font-medium hover:bg-neutral-50">
                    <Plus size={15} />
                    Add Subtasks
                  </button>
                </div>
              </section>

              {/* Comments */}
              <section className="mt-6">
                <h3 className="mb-3 text-sm font-medium">Subtasks</h3>

                <div className="overflow-hidden rounded-md border border-neutral-200">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100 text-[10px]">
                          A
                        </span>

                        <span className="text-sm font-medium">
                          Ankit Dutta
                        </span>

                        <span className="text-xs text-slate-500">
                          just now
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <SmilePlus size={16} />
                        <MoreHorizontal size={16} />
                      </div>
                    </div>

                    <p className="mt-3 text-base">dsds</p>
                  </div>

                  <div className="flex h-12 items-center justify-between border-t border-neutral-200 px-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100 text-[10px]">
                        A
                      </span>

                      <span className="text-sm text-neutral-400">
                        Leave a reply...
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <FileText size={16} />
                      <SendHorizontal size={16} />
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex h-16 items-center justify-between rounded-md border border-neutral-200 px-4">
                  <span className="text-sm text-neutral-500">
                    Add a comment...
                  </span>

                  <div className="flex items-center gap-4">
                    <FileText size={16} />
                    <SendHorizontal size={16} />
                  </div>
                </div>
              </section>
            </main>

            {/* Right Sidebar */}
            <aside className="w-[323px] shrink-0 space-y-5">
              {/* Details */}
              <section className="rounded-lg border border-neutral-200 p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    {showDetails ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                    Details
                  </button>

                  <div className="flex items-center gap-4">
                    <Plus size={16} />
                    <Settings size={16} />
                  </div>
                </div>

                {showDetails && (
                  <div className="mt-5 space-y-5">
                    {/* Status */}
                    <div className="grid grid-cols-[90px_1fr] items-center">
                      <span className="text-xs text-neutral-500">Status</span>

                      <button
                        onClick={() =>
                          updateField(() =>
                            setStatus(
                              status === "Backlog" ? "In Progress" : "Backlog"
                            )
                          )
                        }
                        className="flex items-center gap-1 text-xs font-medium text-orange-600"
                      >
                        <Circle
                          size={12}
                          fill="currentColor"
                          className="text-orange-500"
                        />
                        {status}
                      </button>
                    </div>

                    {/* Priority */}
                    <div className="relative grid grid-cols-[90px_1fr] items-center">
                      <span className="text-xs text-neutral-500">
                        Priority
                      </span>

                      <button
                        onClick={() =>
                          setShowPriorityMenu(!showPriorityMenu)
                        }
                        className="flex items-center gap-1 text-xs font-medium"
                      >
                        <PriorityBadge priority={priority} />
                        <ChevronDown size={12} />
                      </button>

                      {showPriorityMenu && (
                        <div className="absolute right-0 top-7 z-50 w-52 rounded-lg border border-neutral-200 bg-white p-2 shadow-lg">
                          <p className="px-2 py-2 text-xs text-neutral-500">
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
                          ).map((item) => (
                            <button
                              key={item}
                              onClick={() => {
                                updateField(() => setPriority(item));
                                setShowPriorityMenu(false);
                              }}
                              className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm hover:bg-neutral-100"
                            >
                              <PriorityBadge priority={item} />

                              {priority === item && <span>✓</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Members */}
                    <div className="grid grid-cols-[90px_1fr] items-center">
                      <span className="text-xs text-neutral-500">Members</span>

                      <button className="flex items-center gap-1 text-xs font-medium">
                        <UserRound size={14} />
                        Add members
                      </button>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-[90px_1fr] items-center">
                      <span className="text-xs text-neutral-500">Dates</span>

                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1 rounded-full border border-neutral-200 px-2 py-1 text-xs">
                          <Calendar size={12} />
                          Jan 10
                        </button>

                        <span className="text-neutral-400">→</span>

                        <button className="flex items-center gap-1 rounded-full border border-neutral-200 px-2 py-1 text-xs">
                          <Calendar size={12} />
                          End
                        </button>
                      </div>
                    </div>

                    {/* Labels */}
                    <div className="grid grid-cols-[90px_1fr] items-center">
                      <span className="text-xs text-neutral-500">Labels</span>

                      <button className="text-left text-xs font-medium">
                        Add labels
                      </button>
                    </div>

                    {/* Teams */}
                    <div className="grid grid-cols-[90px_1fr] items-center">
                      <span className="text-xs text-neutral-500">Teams</span>

                      <button className="text-left text-xs font-medium">
                        Add teams
                      </button>
                    </div>

                    {/* Reporter */}
                    <div className="grid grid-cols-[90px_1fr] items-center">
                      <span className="text-xs text-neutral-500">
                        Reporter
                      </span>

                      <button className="flex items-center gap-2 text-xs font-medium">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100 text-[10px]">
                          A
                        </span>
                        Ankit Dutta
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* Updates */}
              <section className="rounded-lg border border-neutral-200 p-3 shadow-sm">
                <button
                  onClick={() => setShowUpdates(!showUpdates)}
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  {showUpdates ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                  Updates
                </button>

                {showUpdates && (
                  <div className="mt-5 space-y-5">
                    <div className="flex gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-50">
                        <SignalHigh size={14} className="text-red-500" />
                      </div>

                      <div>
                        <p className="text-sm font-medium">You</p>
                        <p className="mt-1 text-xs text-neutral-500">
                          changed priority from No priority to Urgent
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs">
                        A
                      </div>

                      <div>
                        <p className="text-sm font-medium">You</p>
                        <p className="mt-1 text-xs text-neutral-500">
                          posted an update · Aug 2026
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </aside>
          </div>
        </div>

        {/* Save Bar */}
        {isDirty && (
          <div className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-end gap-3 border-t border-neutral-200 bg-white px-8 shadow-lg">
            <span className="mr-3 text-sm text-neutral-500">
              You have unsaved changes
            </span>

            <button
              onClick={() => {
                setIsDirty(false);
                setSaved(false);
              }}
              className="rounded-md border border-neutral-200 px-4 py-2 text-sm"
            >
              Discard
            </button>

            <button
              onClick={saveChanges}
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
            >
              Save Changes
            </button>
          </div>
        )}

        {saved && (
          <div className="fixed bottom-5 right-5 z-50 rounded-md bg-neutral-900 px-4 py-2 text-sm text-white shadow-lg">
            Changes saved
          </div>
        )}

        {/* Unsaved Changes Modal */}
        {showUnsavedModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30">
            <div className="w-[400px] rounded-xl bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    Unsaved changes
                  </h2>

                  <p className="mt-2 text-sm leading-5 text-neutral-500">
                    You have made changes to this task. Do you want to save
                    them before closing?
                  </p>
                </div>

                <button
                  onClick={() => setShowUnsavedModal(false)}
                  className="rounded-md p-1 hover:bg-neutral-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowUnsavedModal(false);
                    setIsDirty(false);
                  }}
                  className="rounded-md border border-neutral-200 px-4 py-2 text-sm"
                >
                  Discard
                </button>

                <button
                  onClick={async () => {
                    await saveChanges();
                    setShowUnsavedModal(false);
                  }}
                  className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}