"use client";

import { useEffect, useState } from "react";
import {
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

import type { ViewMode } from "../FieldsPopover/FieldsPopOver";
import { useAuth } from "../auth/AuthContext";

type Priority = "High" | "Medium" | "Low";

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

const priorityStyles = {
  High: "text-[#EF4444]",
  Medium: "text-[#F97316]",
  Low: "text-[#9CA3AF]",
};

function PriorityBadge({
  priority,
}: {
  priority: Priority;
}) {
  return (
    <div
      className={`flex items-center gap-1 ${priorityStyles[priority]}`}
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
          alt={project.member}
          className="h-6 w-6 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--surface-secondary)] text-[10px]">
          {project.member.charAt(0)}
        </div>
      )}
    </div>
  );
}

function ProjectRow({
  project,
}: {
  project: Project;
}) {
  return (
    <div className="grid min-w-[850px] grid-cols-[minmax(240px,1fr)_140px_160px_150px_140px] items-center border-b border-[var(--border)] last:border-b-0">
      <div className="px-3 py-3 text-sm font-medium text-[var(--foreground)]">
        {project.title}
      </div>

      <div className="px-3 py-3">
        <PriorityBadge priority={project.priority} />
      </div>

      <div className="px-3 py-3">
        <ProjectMember project={project} />
      </div>

      <div className="px-3 py-3 text-sm text-[var(--foreground)]">
        {project.dueDate
          ? new Date(project.dueDate).toLocaleDateString(
              "en-GB",
              {
                day: "numeric",
                month: "short",
                year: "numeric",
              },
            )
          : "-"}
      </div>

      <div className="px-3 py-3">
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
    </div>
  );
}

function ProjectCard({
  project,
}: {
  project: Project;
}) {
  return (
    <div className="mx-3 mb-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-medium leading-5 text-[var(--foreground)]">
            {project.title}
          </h3>

          {project.description && (
            <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
              {project.description}
            </p>
          )}
        </div>

        <button
          type="button"
          className="flex h-5 w-5 shrink-0 items-center justify-center"
        >
          <MoreHorizontal
            size={14}
            strokeWidth={2}
          />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ProjectMember project={project} />

          <span className="text-xs font-medium text-[var(--foreground)]">
            {project.member}
          </span>
        </div>

        {project.dueDate && (
          <div className="flex h-6 items-center rounded-3xl bg-[#DC26261A] px-3 text-[#DC2626]">
            <span className="text-xs font-medium">
              {new Date(
                project.dueDate,
              ).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>
        )}
      </div>

      <div className="mt-3">
        <PriorityBadge priority={project.priority} />
      </div>
    </div>
  );
}

export default function ProjectBoard() {
  const { user } = useAuth();

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [viewMode, setViewMode] =
    useState<ViewMode>("list");

  const [isAddProjectOpen, setIsAddProjectOpen] =
    useState(false);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const fetchProjects = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/projects/owner/${user.id}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }

        const data: BackendProject[] =
          await response.json();

        const formattedProjects: Project[] =
          data.map((project) => ({
            id: project.id,
            title: project.name,
            description: project.description || "",
            priority: project.priority,
            member: project.owner.name,
            avatar: project.owner.avatar,
            dueDate: project.dueDate || "",
          }));

        setProjects(formattedProjects);
      } catch (error) {
        console.error(
          "Failed to fetch projects:",
          error,
        );
      }
    };

    fetchProjects();
  }, [user?.id]);

  const addProject = (
    project: Project,
  ) => {
    setProjects((currentProjects) => [
      ...currentProjects,
      project,
    ]);
  };

  return (
    <div className="min-h-screen min-w-0 w-full bg-[var(--background)]">
      <main className="w-full px-4 py-4">
        <div className="mx-auto w-full max-w-[1036px]">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h1 className="text-base font-semibold leading-4 text-[var(--foreground)]">
              Projects
            </h1>

            <BoardActions
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              addButtonLabel="Add Project"
              onAdd={() =>
                setIsAddProjectOpen(true)
              }
            />
          </div>

          {viewMode === "list" ? (
            <div className="w-full overflow-x-auto rounded-lg border border-[var(--border)]">
              <div className="min-w-[850px]">
                <div className="grid h-12 grid-cols-[minmax(240px,1fr)_140px_160px_150px_140px] items-center border-b border-[var(--border)] bg-[var(--surface-secondary)]">
                  <div className="px-3 text-sm font-medium text-[var(--foreground)]">
                    Projects
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

                {projects.map((project) => (
                  <ProjectRow
                    key={project.id}
                    project={project}
                  />
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setIsAddProjectOpen(true)
                  }
                  className="flex h-12 items-center gap-1 px-3 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-secondary)]"
                >
                  <Plus size={16} />
                  Add Project
                </button>
              </div>
            </div>
          ) : (
            <section className="w-full overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)]">
              <div className="flex h-[39px] items-center justify-between px-3">
                <div className="flex items-center gap-2">
                  <Columns3
                    size={14}
                    strokeWidth={2}
                  />

                  <span className="text-xs font-semibold text-[var(--foreground)]">
                    Projects
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setIsAddProjectOpen(true)
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

              <div className="flex flex-col">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                  />
                ))}
              </div>

              <div className="flex h-[52px] items-center px-3">
                <button
                  type="button"
                  onClick={() =>
                    setIsAddProjectOpen(true)
                  }
                  className="flex h-6 items-center gap-1 rounded-full px-2 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
                >
                  <Plus
                    size={12}
                    strokeWidth={2}
                  />

                  <span>Add Project</span>
                </button>
              </div>
            </section>
          )}
        </div>
      </main>

      <button
        type="button"
        onClick={() =>
          setIsAddProjectOpen(true)
        }
        className="fixed bottom-6 right-6 flex h-10 items-center gap-2 rounded-full bg-[var(--background)] px-3 shadow-lg ring-1 ring-[#E5E5E5] md:hidden"
      >
        <Plus size={16} />

        <span className="text-xs font-medium">
          Add Project
        </span>
      </button>

      <AddProjectModal
        isOpen={isAddProjectOpen}
        onClose={() =>
          setIsAddProjectOpen(false)
        }
        onCreate={(project) => {
          addProject(project);
          setIsAddProjectOpen(false);
        }}
      />
    </div>
  );
}