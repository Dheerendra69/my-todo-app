"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";

import {
  Check,
  ChevronRight,
  Columns3,
  MoreHorizontal,
  Plus,
  SignalHigh,
  SignalLow,
} from "lucide-react";

import BoardActions from "../BoardActions/BoardActions";

import AddProjectModal, {
  type Project,
} from "../AddProjectModal/AddProjectModal";

import type {
  ViewMode,
} from "../FieldsPopover/FieldsPopOver";

import type {
  FilterState,
} from "../TaskFilter/TaskFilter";

import {
  useAuth,
} from "../Auth/AuthContext";

type Priority = Project["priority"];

type BackendProject = {
  id: string;
  name: string;
  description?: string;
  priority: Priority;
  dueDate?: string | null;
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
};

const initialFilters: FilterState = {
  status: [],
  priority: [],
  members: [],
  dueDate: null,
  teams: [],
  labels: [],
  reporter: [],
};

const priorityOptions: Priority[] = [
  "No Priority",
  "Urgent",
  "High",
  "Medium",
  "Low",
];

const priorityStyles: Partial<
  Record<Priority, string>
> = {
  High: "text-[#EF4444]",
  Medium: "text-[#F97316]",
  Low: "text-[#9CA3AF]",
  Urgent: "text-[#DC2626]",
};

function PriorityBadge({
  priority,
}: {
  priority: Priority;
}) {
  return (
    <div
      className={`flex items-center gap-1 ${priorityStyles[priority] ??
        "text-foreground"
        }`}
    >
      {priority === "Low" ? (
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

function ProjectMember({
  project,
}: {
  project: Project;
}) {
  return (
    <div className="flex items-center gap-2">
      {project.avatar ? (
        <img
          src={project.avatar}
          alt={project.lead}
          className="h-6 w-6 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-secondary text-[10px]">
          {project.lead.charAt(0)}
        </div>
      )}
    </div>
  );
}

function ProjectActionMenu({
  project,
  anchorRef,
  onClose,
  onPriorityChange,
}: {
  project: Project;
  anchorRef: React.RefObject<
    HTMLButtonElement | null
  >;
  onClose: () => void;
  onPriorityChange: (
    projectId: string,
    priority: Priority,
  ) => void;
}) {
  const [
    activeMenu,
    setActiveMenu,
  ] = useState(false);

  const [
    position,
    setPosition,
  ] = useState({
    top: 0,
    left: 0,
  });

  const [
    submenuPlacement,
    setSubmenuPlacement,
  ] = useState<
    "left" | "right" | "top" | "bottom"
  >("left");

  const menuRef =
    useRef<HTMLDivElement>(null);

  const MAIN_MENU_WIDTH = 192;

  const MAIN_MENU_HEIGHT = 48;

  const SUBMENU_HEIGHT = 230;

  const GAP = 10;

  const VIEWPORT_PADDING = 12;

  useLayoutEffect(() => {
    const updatePosition = () => {
      if (!anchorRef.current) {
        return;
      }

      const rect =
        anchorRef.current.getBoundingClientRect();

      const viewportWidth =
        window.innerWidth;

      const viewportHeight =
        window.innerHeight;

      const isMobile =
        viewportWidth < 768;

      const spaceBelow =
        viewportHeight -
        rect.bottom;

      const spaceAbove =
        rect.top;

      const shouldOpenAbove =
        spaceBelow <
        MAIN_MENU_HEIGHT +
        VIEWPORT_PADDING &&
        spaceAbove > spaceBelow;

      let top: number;

      if (shouldOpenAbove) {
        top =
          rect.top -
          MAIN_MENU_HEIGHT -
          GAP;
      } else {
        top =
          rect.bottom +
          GAP;
      }

      top = Math.max(
        VIEWPORT_PADDING,
        Math.min(
          top,
          viewportHeight -
          MAIN_MENU_HEIGHT -
          VIEWPORT_PADDING,
        ),
      );

      let left =
        rect.right -
        MAIN_MENU_WIDTH;

      if (
        left +
        MAIN_MENU_WIDTH >
        viewportWidth -
        VIEWPORT_PADDING
      ) {
        left =
          viewportWidth -
          MAIN_MENU_WIDTH -
          VIEWPORT_PADDING;
      }

      if (
        left <
        VIEWPORT_PADDING
      ) {
        left =
          VIEWPORT_PADDING;
      }

      setPosition({
        top,
        left,
      });

      if (isMobile) {
        const submenuSpaceBelow =
          viewportHeight -
          (top +
            MAIN_MENU_HEIGHT);

        const submenuSpaceAbove =
          top;

        if (
          submenuSpaceBelow >=
          SUBMENU_HEIGHT +
          GAP
        ) {
          setSubmenuPlacement(
            "bottom",
          );
        } else if (
          submenuSpaceAbove >=
          SUBMENU_HEIGHT +
          GAP
        ) {
          setSubmenuPlacement(
            "top",
          );
        } else {
          setSubmenuPlacement(
            submenuSpaceBelow >=
              submenuSpaceAbove
              ? "bottom"
              : "top",
          );
        }

        return;
      }

      const spaceLeft =
        left;

      const spaceRight =
        viewportWidth -
        (left +
          MAIN_MENU_WIDTH);

      if (
        spaceLeft >=
        MAIN_MENU_WIDTH +
        GAP
      ) {
        setSubmenuPlacement(
          "left",
        );
      } else if (
        spaceRight >=
        MAIN_MENU_WIDTH +
        GAP
      ) {
        setSubmenuPlacement(
          "right",
        );
      } else {
        setSubmenuPlacement(
          spaceLeft >=
            spaceRight
            ? "left"
            : "right",
        );
      }
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
  }, [
    anchorRef,
    activeMenu,
  ]);

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

  const getSubmenuClassName = () => {
    if (
      submenuPlacement ===
      "bottom"
    ) {
      return "absolute left-0 top-[calc(100%+10px)] w-48";
    }

    if (
      submenuPlacement ===
      "top"
    ) {
      return "absolute bottom-[calc(100%+10px)] left-0 w-48";
    }

    if (
      submenuPlacement ===
      "right"
    ) {
      return "absolute left-[calc(100%+10px)] top-0 w-48";
    }

    return "absolute right-[calc(100%+10px)] top-0 w-48";
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
      className="z-9999"
    >
      <div className="relative w-48 min-w-48 rounded-md border border-border bg-surface p-1.5 shadow-xl">
        <button
          type="button"
          onClick={() =>
            setActiveMenu(
              !activeMenu,
            )
          }
          className={`flex h-9 w-full items-center gap-2.5 rounded-md px-3 text-foreground ${activeMenu
            ? "bg-surface-secondary"
            : "hover:bg-surface-secondary"
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
      </div>

      {activeMenu && (
        <div
          className={`${getSubmenuClassName()} rounded-md border border-border bg-surface p-1.5 shadow-xl`}
        >
          <div className="flex h-9 items-center px-3">
            <span className="text-xs font-medium text-foreground-secondary">
              Priority
            </span>
          </div>

          {priorityOptions.map(
            (option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onPriorityChange(
                    project.id,
                    option,
                  );

                  onClose();
                }}
                className="flex h-9 w-full items-center justify-between gap-2 rounded-md px-3 text-left hover:bg-surface-secondary"
              >
                <PriorityBadge
                  priority={option}
                />

                <span className="flex h-4 w-4 items-center justify-center">
                  {project.priority ===
                    option && (
                      <Check
                        size={16}
                      />
                    )}
                </span>
              </button>
            ),
          )}
        </div>
      )}
    </div>,
    document.body,
  );
}

function ProjectRow({
  project,
  actionOpen,
  onOpenActions,
  onPriorityChange,
}: {
  project: Project;
  actionOpen: boolean;
  onOpenActions: (
    projectId: string,
  ) => void;
  onPriorityChange: (
    projectId: string,
    priority: Priority,
  ) => void;
}) {
  const actionButtonRef =
    useRef<HTMLButtonElement>(null);

  return (
    <div className="grid min-w-212.5 grid-cols-[minmax(240px,1fr)_140px_160px_150px_140px] items-center border-b border-border last:border-b-0">
      <div className="px-3 py-3 text-sm font-medium text-foreground">
        {project.title}
      </div>

      <div className="justify-self-center py-3">
        <PriorityBadge
          priority={project.priority}
        />
      </div>

      <div className="justify-self-center py-3">
        <ProjectMember
          project={project}
        />
      </div>

      <div className="justify-self-center py-3 text-sm text-foreground">
        {project.dueDate
          ? new Date(
            project.dueDate,
          ).toLocaleDateString(
            "en-GB",
            {
              day: "numeric",
              month: "short",
              year: "numeric",
            },
          )
          : "-"}
      </div>

      <div className="justify-self-center py-3">
        <button
          ref={actionButtonRef}
          type="button"
          onClick={() =>
            onOpenActions(
              actionOpen
                ? ""
                : project.id,
            )
          }
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-surface-secondary"
        >
          <MoreHorizontal
            size={16}
            strokeWidth={2}
          />
        </button>

        {actionOpen && (
          <ProjectActionMenu
            project={project}
            anchorRef={actionButtonRef}
            onClose={() =>
              onOpenActions("")
            }
            onPriorityChange={
              onPriorityChange
            }
          />
        )}
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  actionOpen,
  onOpenActions,
  onPriorityChange,
}: {
  project: Project;
  actionOpen: boolean;
  onOpenActions: (
    projectId: string,
  ) => void;
  onPriorityChange: (
    projectId: string,
    priority: Priority,
  ) => void;
}) {
  const actionButtonRef =
    useRef<HTMLButtonElement>(null);

  return (
    <div className="mx-3 mb-3 rounded-md border border-border bg-background p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-medium leading-5 text-foreground">
            {project.title}
          </h3>

          {project.description && (
            <p className="mt-1 text-xs text-foreground-secondary">
              {project.description}
            </p>
          )}
        </div>

        <button
          ref={actionButtonRef}
          type="button"
          onClick={() =>
            onOpenActions(
              actionOpen
                ? ""
                : project.id,
            )
          }
          className="flex h-5 w-5 shrink-0 items-center justify-center"
        >
          <MoreHorizontal
            size={14}
            strokeWidth={2}
          />
        </button>

        {actionOpen && (
          <ProjectActionMenu
            project={project}
            anchorRef={actionButtonRef}
            onClose={() =>
              onOpenActions("")
            }
            onPriorityChange={
              onPriorityChange
            }
          />
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ProjectMember
            project={project}
          />

          <span className="text-xs font-medium text-foreground">
            {project.lead}
          </span>
        </div>

        {project.dueDate && (
          <div className="flex h-6 items-center rounded-3xl bg-[#DC26261A] px-3 text-[#DC2626]">
            <span className="text-xs font-medium">
              {new Date(
                project.dueDate,
              ).toLocaleDateString(
                "en-GB",
                {
                  day: "numeric",
                  month: "short",
                },
              )}
            </span>
          </div>
        )}
      </div>

      <div className="mt-3">
        <PriorityBadge
          priority={project.priority}
        />
      </div>
    </div>
  );
}

export default function ProjectBoard() {
  const { user } = useAuth();

  const [
    projects,
    setProjects,
  ] = useState<Project[]>([]);

  const [
    originalProjects,
    setOriginalProjects,
  ] = useState<Project[]>([]);

  const [
    filters,
    setFilters,
  ] = useState<FilterState>(
    initialFilters,
  );

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    viewMode,
    setViewMode,
  ] = useState<ViewMode>(
    "list",
  );

  const [
    isAddProjectOpen,
    setIsAddProjectOpen,
  ] = useState(false);

  const [
    openActionProjectId,
    setOpenActionProjectId,
  ] = useState<
    string | null
  >(null);

  const [
    isDirty,
    setIsDirty,
  ] = useState(false);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    saved,
    setSaved,
  ] = useState(false);

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

          const data:
            BackendProject[] =
            await response.json();

          const formattedProjects:
            Project[] = data.map(
              (project) => ({
                id: project.id,
                title: project.name,
                description:
                  project.description ||
                  "",
                priority:
                  project.priority,

                lead:
                  project.owner.name,

                avatar:
                  project.owner.avatar,

                dueDate:
                  project.dueDate ||
                  "",
              }),
            );

          setProjects(
            formattedProjects,
          );

          setOriginalProjects(
            formattedProjects,
          );

          setIsDirty(false);
        } catch (error) {
          console.error(
            "Failed to fetch projects:",
            error,
          );
        }
      };

    fetchProjects();
  }, [user?.id]);

  const updateProjectPriority = (
    projectId: string,
    priority: Priority,
  ) => {
    setProjects(
      (currentProjects) =>
        currentProjects.map(
          (project) => {
            if (
              project.id !==
              projectId
            ) {
              return project;
            }

            return {
              ...project,
              priority,
            };
          },
        ),
    );

    setIsDirty(true);

    setSaved(false);
  };

  const discardChanges = () => {
    setProjects(
      originalProjects,
    );

    setIsDirty(false);

    setOpenActionProjectId(
      null,
    );
  };

  const saveChanges =
    async () => {
      try {
        setIsSaving(true);

        const changedProjects =
          projects.filter(
            (project) => {
              const originalProject =
                originalProjects.find(
                  (original) =>
                    original.id ===
                    project.id,
                );

              return (
                originalProject &&
                originalProject.priority !==
                project.priority
              );
            },
          );

        await Promise.all(
          changedProjects.map(
            async (project) => {
              const response =
                await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/projects/${project.id}`,
                  {
                    method: "PATCH",
                    headers: {
                      "Content-Type":
                        "application/json",
                    },
                    body: JSON.stringify({
                      priority:
                        project.priority,
                    }),
                  },
                );

              if (!response.ok) {
                throw new Error(
                  `Failed to update project ${project.id}`,
                );
              }
            },
          ),
        );

        setOriginalProjects(
          projects,
        );

        setIsDirty(false);

        setSaved(true);

        setTimeout(() => {
          setSaved(false);
        }, 2500);
      } catch (error) {
        console.error(
          "Failed to save projects:",
          error,
        );
      } finally {
        setIsSaving(false);
      }
    };

  const normalizedSearchQuery =
    searchQuery
      .trim()
      .toLowerCase();

  const filteredProjects =
    projects
      .filter(
        (project) => {
          const matchesSearch =
            normalizedSearchQuery ===
            "" ||
            project.title
              .toLowerCase()
              .includes(
                normalizedSearchQuery,
              ) ||
            project.description
              ?.toLowerCase()
              .includes(
                normalizedSearchQuery,
              );

          const matchesPriority =
            filters.priority
              .length === 0 ||
            filters.priority.includes(
              project.priority,
            );

          return (
            matchesSearch &&
            matchesPriority
          );
        },
      )
      .sort(
        (a, b) => {
          if (
            !filters.dueDate
          ) {
            return 0;
          }

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
        },
      );

  const addProject = (
    project: Project,
  ) => {
    setProjects(
      (currentProjects) => [
        ...currentProjects,
        project,
      ],
    );

    setOriginalProjects(
      (currentProjects) => [
        ...currentProjects,
        project,
      ],
    );
  };

  return (
    <div className="min-h-screen min-w-0 w-full bg-background">
      <main className="w-full px-4 py-4 pb-24">
        <div className="mx-auto w-full max-w-259">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h1 className="text-base font-semibold leading-4 text-foreground">
              Projects
            </h1>

            <BoardActions
              viewMode={viewMode}
              onViewModeChange={
                setViewMode
              }
              addButtonLabel="Add Project"
              onAdd={() =>
                setIsAddProjectOpen(
                  true,
                )
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
            <div className="w-full overflow-x-auto rounded-lg border border-border">
              <div className="min-w-212.5">
                <div className="grid h-12 grid-cols-[minmax(240px,1fr)_140px_160px_150px_140px] items-center border-b border-border bg-surface-secondary">
                  <div className="px-3 text-sm font-medium text-foreground">
                    Projects
                  </div>

                  <div className="justify-self-center text-sm font-medium text-foreground">
                    Priority
                  </div>

                  <div className="justify-self-center text-sm font-medium text-foreground">
                    Members
                  </div>

                  <div className="justify-self-center text-sm font-medium text-foreground">
                    Due Date
                  </div>

                  <div className="justify-self-center text-sm font-medium text-foreground">
                    Actions
                  </div>
                </div>

                {filteredProjects.map(
                  (project) => (
                    <ProjectRow
                      key={project.id}
                      project={project}
                      actionOpen={
                        openActionProjectId ===
                        project.id
                      }
                      onOpenActions={(
                        projectId,
                      ) =>
                        setOpenActionProjectId(
                          projectId ||
                          null,
                        )
                      }
                      onPriorityChange={
                        updateProjectPriority
                      }
                    />
                  ),
                )}

                {filteredProjects.length ===
                  0 && (
                    <div className="flex h-24 items-center justify-center text-sm text-foreground-secondary">
                      No projects found.
                    </div>
                  )}

                <button
                  type="button"
                  onClick={() =>
                    setIsAddProjectOpen(
                      true,
                    )
                  }
                  className="flex h-12 items-center gap-1 px-3 text-sm font-medium text-foreground hover:bg-surface-secondary"
                >
                  <Plus size={16} />
                  Add Project
                </button>
              </div>
            </div>
          ) : (
            <section className="w-full overflow-hidden rounded-lg border border-border bg-surface-secondary">
              <div className="flex h-9.75 items-center justify-between px-3">
                <div className="flex items-center gap-2">
                  <Columns3
                    size={14}
                    strokeWidth={2}
                  />

                  <span className="text-xs font-semibold text-foreground">
                    Projects
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setIsAddProjectOpen(
                        true,
                      )
                    }
                    className="flex h-5 w-5 items-center justify-center rounded-md hover:bg-background"
                  >
                    <Plus
                      size={14}
                      strokeWidth={2}
                    />
                  </button>

                  <button
                    type="button"
                    className="flex h-5 w-5 items-center justify-center rounded-md hover:bg-background"
                  >
                    <MoreHorizontal
                      size={14}
                      strokeWidth={2}
                    />
                  </button>
                </div>
              </div>

              <div className="flex flex-col">
                {filteredProjects.map(
                  (project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      actionOpen={
                        openActionProjectId ===
                        project.id
                      }
                      onOpenActions={(
                        projectId,
                      ) =>
                        setOpenActionProjectId(
                          projectId ||
                          null,
                        )
                      }
                      onPriorityChange={
                        updateProjectPriority
                      }
                    />
                  ),
                )}

                {filteredProjects.length ===
                  0 && (
                    <div className="flex h-24 items-center justify-center text-sm text-foreground-secondary">
                      No projects found.
                    </div>
                  )}
              </div>

              <div className="flex h-13 items-center px-3">
                <button
                  type="button"
                  onClick={() =>
                    setIsAddProjectOpen(
                      true,
                    )
                  }
                  className="flex h-6 items-center gap-1 rounded-full px-2 text-xs font-medium text-foreground hover:bg-background"
                >
                  <Plus
                    size={12}
                    strokeWidth={2}
                  />

                  <span>
                    Add Project
                  </span>
                </button>
              </div>
            </section>
          )}
        </div>
      </main>

      {isDirty && (
        <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col gap-3 border-t border-border bg-surface px-4 py-3 shadow-lg sm:flex-row sm:items-center sm:justify-end sm:px-8">
          <div className="w-full sm:mr-auto sm:w-auto">
            <span className="text-sm text-foreground-secondary">
              You have unsaved changes
            </span>
          </div>

          <div className="flex w-full justify-end gap-3 sm:w-auto">
            <button
              type="button"
              onClick={discardChanges}
              disabled={isSaving}
              className="flex-1 rounded-md border border-border px-4 py-2 text-sm text-foreground hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              Discard
            </button>

            <button
              type="button"
              onClick={saveChanges}
              disabled={isSaving}
              className="flex-1 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              {isSaving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {saved && (
        <div className="fixed bottom-5 right-5 z-50 rounded-md bg-foreground px-4 py-2 text-sm text-background shadow-lg">
          Changes saved
        </div>
      )}

      <button
        type="button"
        onClick={() =>
          setIsAddProjectOpen(
            true,
          )
        }
        className="fixed bottom-12 right-6 flex h-10 items-center gap-2 rounded-full bg-background px-3 shadow-lg ring-1 ring-[#E5E5E5] md:hidden"
      >
        <Plus size={16} />

        <span className="text-xs font-medium">
          Add Project
        </span>
      </button>

      <AddProjectModal
        isOpen={
          isAddProjectOpen
        }
        onClose={() =>
          setIsAddProjectOpen(
            false,
          )
        }
        onCreate={(project) => {
          addProject(project);

          setIsAddProjectOpen(
            false,
          );
        }}
      />
    </div>
  );
}