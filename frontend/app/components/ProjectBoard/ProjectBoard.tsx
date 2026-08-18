"use client";

import { useState } from "react";
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

type Priority = "High" | "Medium" | "Low";

const initialProjects: Project[] = [
  {
    id: 1,
    title: "Design Homepage",
    description: "",
    priority: "High",
    lead: "Admin",
    avatar: "https://i.pravatar.cc/100?img=47",
    dueDate: "2026-07-29",
  },
  {
    id: 2,
    title: "Develop Login Feature",
    description: "",
    priority: "Low",
    lead: "Admin",
    avatar: "https://i.pravatar.cc/100?img=47",
    dueDate: "2026-07-29",
  },
  {
    id: 3,
    title: "Test Payment Gateway",
    description: "",
    priority: "Medium",
    lead: "Admin",
    avatar: "https://i.pravatar.cc/100?img=47",
    dueDate: "2026-07-30",
  },
];

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
      className={`flex items-center gap-1 ${priorityStyles[priority]
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

function ProjectLead({
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
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--surface-secondary)] text-[10px]">
          {project.lead.charAt(0)}
        </div>
      )}

      <span className="text-sm text-[var(--foreground)]">
        {project.lead}
      </span>
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
        <PriorityBadge
          priority={project.priority}
        />
      </div>

      <div className="px-3 py-3">
        <ProjectLead project={project} />
      </div>

      <div className="px-3 py-3 text-sm text-[var(--foreground)]">
        {project.dueDate
          ? new Date(
            project.dueDate,
          ).toLocaleDateString(
            "en-US",
            {
              day: "numeric",
              month: "short",
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
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
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
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md hover:bg-[var(--surface-secondary)]"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <ProjectLead project={project} />

        <PriorityBadge
          priority={project.priority}
        />
      </div>

      {project.dueDate && (
        <div className="mt-3 text-xs text-[var(--foreground-secondary)]">
          Due{" "}
          {new Date(
            project.dueDate,
          ).toLocaleDateString(
            "en-US",
            {
              day: "numeric",
              month: "short",
            },
          )}
        </div>
      )}
    </div>
  );
}

export default function ProjectBoard() {
  const [projects, setProjects] =
    useState<Project[]>(initialProjects);

  const [viewMode, setViewMode] =
    useState<ViewMode>("list");

  const [isAddProjectOpen, setIsAddProjectOpen] =
    useState(false);

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
                    Lead
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
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                />
              ))}

              <button
                type="button"
                onClick={() =>
                  setIsAddProjectOpen(true)
                }
                className="flex min-h-[160px] items-center justify-center rounded-lg border border-dashed border-[var(--border)] text-sm font-medium text-[var(--foreground-secondary)] hover:bg-[var(--surface-secondary)]"
              >
                <Plus size={16} />
                <span className="ml-2">
                  Add Project
                </span>
              </button>
            </div>
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