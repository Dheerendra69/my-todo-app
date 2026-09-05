"use client";

import { useEffect, useState } from "react";

import { ChevronRight, PanelLeft } from "lucide-react";

import { usePathname, useRouter } from "next/navigation";

type TopBarProps = {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
};

type TaskResponse = {
  id: string;
  title: string;
};

type ProjectResponse = {
  id: string;
  name: string;
};

export default function TopBar({
  isSidebarOpen,
  onToggleSidebar,
}: TopBarProps) {
  const pathname = usePathname();

  const router = useRouter();

  const [title, setTitle] = useState("");

  const [section, setSection] = useState("");

  const pathParts = pathname.split("/").filter(Boolean);

  const isTaskDetails = pathParts[0] === "tasks" && pathParts.length === 2;

  const isProjectDetails =
    pathParts[0] === "projects" && pathParts.length === 2;

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        if (isTaskDetails) {
          const taskId = pathParts[1];

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}`,
          );

          if (!response.ok) {
            return;
          }

          const task: TaskResponse = await response.json();

          setSection("Tasks");
          setTitle(task.title);

          return;
        }

        if (isProjectDetails) {
          const projectId = pathParts[1];

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}`,
          );

          if (!response.ok) {
            return;
          }

          const project: ProjectResponse = await response.json();

          setSection("Projects");
          setTitle(project.name);

          return;
        }

        if (pathname === "/tasks") {
          setSection("");
          setTitle("Tasks");

          return;
        }

        if (pathname === "/projects") {
          setSection("");
          setTitle("Projects");

          return;
        }

        setSection("");
        setTitle("");
      } catch (error) {
        console.error("Failed to fetch page title:", error);
      }
    };

    fetchPageData();
  }, [pathname, isTaskDetails, isProjectDetails]);

  return (
    <header className="flex h-16 w-full items-center border-b border-border bg-background px-4">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-foreground transition-colors hover:bg-surface-secondary hover:text-(--accent-color)"
        >
          <PanelLeft size={16} strokeWidth={2} />
        </button>

        <div className="h-3.75 w-px shrink-0 bg-border" />

        <nav className="flex min-w-0 items-center gap-2 text-sm">
          {section && (
            <>
              <button
                type="button"
                onClick={() =>
                  router.push(section === "Tasks" ? "/tasks" : "/projects")
                }
                className="shrink-0 text-foreground-secondary transition-colors hover:text-(--accent-color)"
              >
                {section}
              </button>

              <ChevronRight
                size={15}
                strokeWidth={2}
                className="shrink-0 text-foreground-secondary"
              />
            </>
          )}

          <span
            className="truncate font-medium"
            style={{
              color: "var(--accent-color)",
            }}
          >
            {title}
          </span>
        </nav>
      </div>
    </header>
  );
}
