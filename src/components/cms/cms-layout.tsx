"use client";

import React, { useState } from "react";
import { Sidebar } from "./sidebar";
import { HeartIcon } from "@phosphor-icons/react";

interface CMSLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function CMSLayout({
  children,
  title,
  description,
  actions,
}: CMSLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("cms_sidebar_collapsed") === "true";
  });

  const handleToggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem("cms_sidebar_collapsed", String(newState));
  };

  return (
    <div className="flex h-screen w-full bg-zinc-50 overflow-hidden">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={handleToggleSidebar}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full">
        <header className="h-14 border-b border-zinc-200 bg-zinc-50/95 backdrop-blur supports-backdrop-filter:bg-zinc-50/60 shrink-0 z-10">
          <div className="flex h-full items-center justify-between px-4 sm:px-6">
            <div className="flex flex-col justify-center min-w-0">
              <h1 className="text-base font-semibold text-foreground leading-none truncate">
                {title}
              </h1>
              {description && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {description}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-2 ml-4 shrink-0">
                {actions}
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
          {children}
        </main>

        <footer className="h-10 border-t border-zinc-200 bg-white shrink-0 flex items-center justify-center gap-1.5 text-xs text-zinc-400 font-medium">
          <span>Made with</span>
          <HeartIcon
            weight="fill"
            className="h-3.5 w-3.5 text-red-500 animate-pulse"
          />
          <span>for TechnoVIT</span>
        </footer>
      </div>
    </div>
  );
}
