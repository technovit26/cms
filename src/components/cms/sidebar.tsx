"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import {
  HouseIcon,
  CalendarBlankIcon,
  FolderOpenIcon,
  UploadSimpleIcon,
  SignOutIcon,
  SidebarSimpleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/", icon: HouseIcon },
  { name: "Events", href: "/events", icon: CalendarBlankIcon },
  { name: "Media Browser", href: "/media", icon: FolderOpenIcon },
  { name: "Upload Media", href: "/upload", icon: UploadSimpleIcon },
];

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  isMobileOpen: boolean;
  closeMobile: () => void;
}

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function Sidebar({
  isCollapsed,
  toggleSidebar,
  isMobileOpen,
  closeMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const isMounted = useIsMounted();

  if (!isMounted) {
    return <aside className="hidden md:block w-20 border-r bg-white" />;
  }

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r border-zinc-200 bg-white flex flex-col transition-transform duration-300 ease-in-out shrink-0",
          "md:relative md:translate-x-0 md:transition-all",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "md:w-20" : "md:w-72",
        )}
      >
        <div
          className={cn(
            "flex h-14 shrink-0 items-center px-4 border-b border-zinc-200 transition-all",
            isCollapsed ? "md:justify-center" : "justify-between",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3 overflow-hidden transition-all",
              isCollapsed
                ? "w-auto opacity-100 flex md:w-0 md:opacity-0 md:hidden"
                : "w-auto opacity-100 flex",
            )}
          >
            <span className="text-base font-bold tracking-tight text-foreground whitespace-nowrap">
              TechnoVIT
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hidden md:inline-flex h-9 w-9 rounded-none text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
          >
            <SidebarSimpleIcon className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={closeMobile}
            className="md:hidden h-9 w-9 rounded-none text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
          >
            <XIcon className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto overflow-x-hidden">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMobile}
                title={isCollapsed ? item.name : undefined}
                className={cn(
                  "flex items-center rounded-none py-3 text-sm font-medium transition-all border-l-2 cursor-pointer whitespace-nowrap",
                  "justify-start gap-3 px-3",
                  isCollapsed ? "md:justify-center md:px-0" : "",
                  isActive
                    ? "bg-zinc-100 text-foreground border-foreground"
                    : "text-muted-foreground hover:bg-zinc-50 hover:text-foreground border-transparent",
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span
                  className={cn(
                    "transition-all duration-300",
                    isCollapsed
                      ? "w-auto opacity-100 block md:w-0 md:opacity-0 md:overflow-hidden md:hidden"
                      : "w-auto opacity-100 block",
                  )}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-zinc-200 bg-white">
          <SignOutButton redirectUrl="/sign-in">
            <button
              title="Sign Out"
              className={cn(
                "flex w-full items-center rounded-none py-3 text-sm font-medium transition-all border-l-2 border-transparent",
                "text-muted-foreground hover:bg-red-50 hover:text-red-600 hover:border-red-600",
                "cursor-pointer justify-start gap-3 px-3",
                isCollapsed ? "md:justify-center md:px-0" : "",
              )}
            >
              <SignOutIcon className="h-5 w-5 shrink-0" />
              <span
                className={cn(
                  "transition-all duration-300",
                  isCollapsed
                    ? "w-auto opacity-100 block md:w-0 md:opacity-0 md:overflow-hidden md:hidden"
                    : "w-auto opacity-100 block",
                )}
              >
                Sign Out
              </span>
            </button>
          </SignOutButton>
        </div>
      </aside>
    </>
  );
}
