"use client";

import { useState } from "react";
import Sidebar from "../Sidebar/Sidebar";
import TopBar from "../TopBar/TopBar";
import { usePathname } from "next/navigation";

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({
  children,
}: AppShellProps) {
  const [
    isSidebarOpen,
    setIsSidebarOpen,
  ] = useState(true);

  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsSidebarOpen(
      (prev) => !prev,
    );
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const hasTopBar =
    pathname !== "/settings/theme";

  return (
    <div className="h-dvh overflow-hidden bg-background">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />

      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={closeSidebar}
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
        />
      )}

      <div
        className={`flex h-dvh flex-col transition-[margin] duration-200 ${isSidebarOpen
            ? "md:ml-64"
            : "md:ml-0"
          }`}
      >
        {hasTopBar && (
          <div className="shrink-0">
            <TopBar
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={
                toggleSidebar
              }
            />
          </div>
        )}

        <main className="min-h-0 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}