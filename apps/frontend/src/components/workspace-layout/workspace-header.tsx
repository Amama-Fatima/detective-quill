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
    <header className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:gap-6 md:px-6">
      <div className="flex min-w-0 items-center gap-9">
        <Link href="/" className="">
          <Image
            src="/quill-logo.png"
            alt="Detective's Quill Logo"
            width={130}
            height={110}
            className="text-primary background-transparent"
          />
        </Link>

        <Link
          href={`/workspace/${projectId}`}
          className="tracking-tight text-xl font-semibold case-file text-foreground hover:underline "
        >
          {projectTitle}
        </Link>
      </div>

      <nav className="flex flex-wrap items-center gap-2 md:justify-end">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary-foreground hover:text-secondary"
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
};

export default WorkspaceHeader;
