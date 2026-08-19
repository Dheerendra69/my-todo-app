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

  return (
    <div className="min-h-screen bg-[var(--background)]">
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
        className={`min-h-screen transition-[margin] duration-200 ${isSidebarOpen
          ? "md:ml-64"
          : "md:ml-0"
          }`}
      >
        {pathname !== "/settings/theme" && (
          <TopBar
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={
              toggleSidebar
            }
          />
        )}

        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}