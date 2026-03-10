import Link from "next/link";
import Image from "next/image";
import { NAV_ITEMS } from "@/constants/project-constants";
import { MenuIcon } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface WorkspaceHeaderProps {
  projectId: string;
  projectTitle: string;
}

const WorkspaceHeader = ({ projectId, projectTitle }: WorkspaceHeaderProps) => {
  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    href: item.href.replace("123", projectId),
  }));

  return (
    <header className="fixed inset-x-0 top-0 z-100 border-b bg-chart-3/20 backdrop-blur-md transition-all duration-300 ease-in-out supports-backdrop-filter:bg-chart-3/13">
      <div className="mx-auto flex flex-row md:flex-col lg:flex-row w-full max-w-7xl gap-2 px-3 py-2 sm:h-17 md:h-27 lg:h-17 sm:flex-row sm:items-center justify-between md:justify-start lg:justify-between sm:px-6 sm:py-0">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5 lg:gap-7">
          <Link href="/" className="shrink-0">
            <div className="relative h-10.5 w-34 overflow-hidden sm:h-14 sm:w-45">
              <Image
                src="/logo.png"
                alt="Detective's Quill Logo"
                fill
                sizes="(max-width: 640px) 136px, 180px"
                className="object-cover object-center"
              />
            </div>
          </Link>

          <Link
            href={`/workspace/${projectId}`}
            className="case-file max-w-40 truncate text-base font-semibold tracking-tight text-foreground transition-colors hover:underline sm:max-w-56 sm:text-lg md:max-w-80 md:text-xl"
            title={projectTitle}
          >
            {projectTitle}
          </Link>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
              aria-label="Open navigation menu"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="md:hidden">
            <SheetHeader>
              <SheetTitle className="case-file text-base">
                Workspace Menu
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4 pb-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SheetClose asChild key={item.id}>
                    <Link
                      href={item.href}
                      className="noir-text inline-flex items-center gap-3 rounded-md px-3 py-2 text-md text-foreground transition-colors hover:bg-accent/40 hover:text-secondary-foreground"
                    >
                      <Icon className="h-4 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </SheetClose>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>

        <nav className="-mx-1 hidden w-full items-center gap-1 overflow-x-auto px-1 pb-1 md:mx-0 md:flex md:w-auto md:gap-2 md:overflow-visible md:px-0 md:pb-0 md:justify-end">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                className="noir-text inline-flex shrink-0 items-center gap-2 rounded-md px-2 py-1 text-sm text-foreground transition-colors duration-200 hover:bg-accent/40 hover:text-secondary-foreground sm:text-base"
                title={item.label}
              >
                <Icon className="h-4 w-5" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default WorkspaceHeader;
