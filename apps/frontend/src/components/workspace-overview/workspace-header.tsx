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
    <header className="sticky top-0 z-50 h-14 flex items-center border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="flex w-full items-center justify-between px-5">
        {/* Mobile: logo (hidden on md+ since sidebar shows it) */}
        <Link href="/" className="shrink-0 md:hidden">
          <div className="relative h-9 w-28 overflow-hidden">
            <Image
              src="/logo.png"
              alt="Detective's Quill Logo"
              fill
              sizes="112px"
              className="object-cover object-center"
            />
          </div>
        </Link>

        {/* Project title */}
        <Link
          href={`/workspace/${projectId}`}
          className="case-file truncate text-[15px] font-semibold tracking-tight text-foreground hover:text-primary transition-colors max-w-[200px] sm:max-w-sm md:max-w-lg"
          title={projectTitle}
        >
          {projectTitle}
        </Link>

        {/* Mobile hamburger */}
        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center border border-border/60 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
              aria-label="Open navigation menu"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="md:hidden bg-primary border-l border-primary/30 p-0"
          >
            <SheetHeader className="px-5 py-5 border-b border-primary-foreground/10">
              <SheetTitle className="font-playfair-display text-[15px] text-primary-foreground text-left">
                The Writer&apos;s Studio
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-0.5 px-3 py-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SheetClose asChild key={item.id}>
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-3 px-3 py-2.5 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/8 transition-colors"
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="noir-text text-[14px]">
                        {item.label}
                      </span>
                    </Link>
                  </SheetClose>
                );
              })}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 px-3 py-4 border-t border-primary-foreground/10">
              <SheetClose asChild>
                <Link
                  href="/projects"
                  className="flex items-center gap-2.5 px-3 py-2 text-primary-foreground/50 hover:text-primary-foreground transition-colors"
                >
                  <span className="text-sm">←</span>
                  <span className="case-file text-[10px] tracking-[0.1em]">
                    All Projects
                  </span>
                </Link>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default WorkspaceHeader;
