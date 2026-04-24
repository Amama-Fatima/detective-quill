"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/constants/project-constants";
import {
  ChevronLeftIcon,
  LayoutDashboardIcon,
  FolderOpenIcon,
} from "lucide-react";
import Image from "next/image";

interface WorkspaceSidebarProps {
  projectId: string;
  collapsed: boolean;
  onCollapsedChange: (val: boolean) => void;
}

const EXPANDED_WIDTH = "w-[260px]";
const COLLAPSED_WIDTH = "w-[80px]";

export default function WorkspaceSidebar({
  projectId,
  collapsed,
  onCollapsedChange,
}: WorkspaceSidebarProps) {
  const pathname = usePathname();
  const overviewHref = `/workspace/${projectId}`;

  const navItems = [
    {
      id: "overview",
      label: "Overview",
      href: overviewHref,
      icon: LayoutDashboardIcon,
      description: "Project at a glance",
    },
    ...NAV_ITEMS.map((item) => ({
      ...item,
      href: item.href.replace("123", projectId),
    })),
  ];

  return (
    <aside
      className={`
        fixed left-0 top-0 bottom-0 z-40 flex flex-col
        bg-primary border-r border-primary-foreground/10
        transition-all duration-300 ease-in-out
        ${collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH}
      `}
    >
      {/* ── Brand ── */}
      <div
        className={`relative flex items-center px-6 py-7 border-b border-primary/10 min-h-20 ${collapsed ? "bg-primary" : "bg-primary-foreground"}`}
      >
        <Link href="/" className="block overflow-hidden">
          {collapsed ? (
            <Image
              src="/quill.svg"
              alt="Detective's Quill Logo"
              fill
              sizes="180px"
              className="object-cover object-center"
            />
          ) : (
            <div className="flex flex-col  justify-between">
              <Image
                src="/logo.png"
                alt="Detective's Quill Logo"
                fill
                sizes="180px"
                className="object-cover object-center"
              />
              {/* hello */}
              {/* <p className="font-playfair-display text-[18px] font-bold text-primary-foreground/90 leading-snug whitespace-nowrap">
                The Writer&apos;s Studio
              </p> */}
            </div>
          )}
        </Link>

        {/* Collapse toggle */}
        <button
          onClick={() => onCollapsedChange(!collapsed)}
          className="
            absolute -right-3 top-1/2 -translate-y-1/2
            h-6 w-6 flex items-center justify-center
            bg-primary border border-primary-foreground/20
            text-primary-foreground/50 hover:text-primary-foreground
            transition-colors duration-200
            shadow-md
          "
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeftIcon
            className={`h-3.5 w-3.5 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* ── Nav links ── */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.id === "overview"
              ? pathname === overviewHref
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`
                group relative flex items-center gap-4
                px-3 py-4
                border-l-[3px]
                transition-colors duration-150
                ${
                  isActive
                    ? "bg-primary-foreground/10 text-primary-foreground border-primary-foreground"
                    : "text-primary-foreground/50 hover:text-primary-foreground/90 hover:bg-primary-foreground/6 border-transparent"
                }
              `}
            >
              <Icon className="h-[17px] w-[17px] shrink-0 opacity-80" />

              {!collapsed && (
                <span className="flex flex-col gap-1.5 overflow-hidden">
                  {/* Label — Crimson Text (serif), softer weight */}
                  <span className="font-serif text-[14px] font-normal leading-none whitespace-nowrap tracking-wide">
                    {item.label}
                  </span>
                  {/* Description — Geist Mono, very faint */}
                  <span className="font-mono text-[10px] leading-none text-primary-foreground/35 whitespace-nowrap tracking-[0.06em]">
                    {item.description}
                  </span>
                </span>
              )}

              {/* Collapsed tooltip */}
              {collapsed && (
                <div
                  className="
                  pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2
                  bg-primary-foreground text-primary
                  px-3 py-1.5
                  font-mono text-[11px] tracking-[0.06em] whitespace-nowrap
                  opacity-0 group-hover:opacity-100
                  transition-opacity duration-150
                  shadow-lg z-50
                "
                >
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Back to projects ── */}
      <div className="px-4 py-6 border-t border-primary-foreground/10">
        <Link
          href="/projects"
          title={collapsed ? "All Projects" : undefined}
          className="group relative flex items-center gap-4 px-3 py-3.5 text-primary-foreground/35 hover:text-primary-foreground/70 transition-colors duration-150"
        >
          <FolderOpenIcon className="h-[17px] w-[17px] shrink-0" />
          {!collapsed && (
            <span className="font-mono text-[10px] tracking-[0.12em] uppercase whitespace-nowrap">
              All Projects
            </span>
          )}
          {collapsed && (
            <div
              className="
              pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2
              bg-primary-foreground text-primary
              px-3 py-1.5
              font-mono text-[11px] tracking-[0.06em] whitespace-nowrap
              opacity-0 group-hover:opacity-100
              transition-opacity duration-150
              shadow-lg z-50
            "
            >
              All Projects
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
}
