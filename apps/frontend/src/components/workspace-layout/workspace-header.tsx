import Link from "next/link";
import Image from "next/image";
import { NAV_ITEMS } from "@/constants/project-constants";

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
    <div className="sticky top-0 z-50 w-full p-4">
      <header className="mx-auto max-w-7xl rounded-2xl border border-border bg-chart-4 backdrop-blur supports-[backdrop-filter]:bg-chart-4/18 shadow-sm">
        <div className="flex min-h-16 flex-col justify-center gap-3 px-4 py-3 md:h-16 md:flex-row md:items-center md:justify-between md:gap-6 md:px-6 md:py-0">
          <div className="flex min-w-0 items-center gap-5 md:gap-7">
            <Link href="/" className="shrink-0">
              <Image
                src="/quill-logo.png"
                alt="Detective's Quill Logo"
                width={122}
                height={102}
                className="text-primary background-transparent"
              />
            </Link>

            <Link
              href={`/workspace/${projectId}`}
              className="case-file truncate tracking-tight text-lg font-semibold text-foreground transition-colors hover:text-underline md:text-xl"
              title={projectTitle}
            >
              {projectTitle}
            </Link>
          </div>

          <nav className="flex flex-wrap items-center gap-4 md:justify-end">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="inline-flex items-center gap-2 text-md font-medium text-foreground/80 transition-colors hover:text-foreground hover:bg-accent/40 rounded-md px-2 py-1"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
    </div>
  );
};

export default WorkspaceHeader;
