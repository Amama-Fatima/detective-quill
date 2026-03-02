import Link from "next/link";
import Image from "next/image";
import { NAV_ITEMS } from "@/constants/project-constants";
import { BlueprintIcon } from "@/components/icons/blueprint-icon";
import { GraphIcon } from "@/components/icons/graph-icon";
import { CaseFileIcon } from "@/components/icons/case-file-icon";
import { VersionControlIcon } from "../icons/version-control-icon";

interface WorkspaceHeaderProps {
  projectId: string;
  projectTitle: string;
}

const WorkspaceHeader = ({ projectId, projectTitle }: WorkspaceHeaderProps) => {
  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    href: item.href.replace("123", projectId),
  }));

  // const renderNavIcon = (
  //   id: string,
  //   FallbackIcon: React.ComponentType<{ className?: string }>,
  // ) => {
  //   if (id === "blueprint") {
  //     return <BlueprintIcon size={16} />;
  //   }

  //   if (id === "text-editor") {
  //     return (
  //       <span className="inline-flex items-center justify-center [&>svg]:h-4 [&>svg]:w-4">
  //         <CaseFileIcon />
  //       </span>
  //     );
  //   }

  //   if (id === "version-control") {
  //     return <VersionControlIcon size={16} />;
  //   }

  //   if (id === "visualization") {
  //     return <GraphIcon size={16} />;
  //   }

  //   return <FallbackIcon className="h-4 w-4" />;
  // };

  return (
    <header className="fixed inset-x-0 top-0 z-[100] border-b border-secondary-foreground/40 bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ease-in-out">
      <div className="mx-auto flex h-[68px] w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-12">
        <div className="flex min-w-0 items-center gap-5 md:gap-7">
          <Link href="/" className="shrink-0">
            <div className="relative h-[56px] w-[180px] overflow-hidden">
              <Image
                src="/logo.png"
                alt="Detective's Quill Logo"
                fill
                sizes="180px"
                className="object-cover object-center"
              />
            </div>
          </Link>

          <Link
            href={`/workspace/${projectId}`}
            className="case-file truncate text-lg font-semibold tracking-tight text-foreground transition-colors hover:text-secondary-foreground md:text-xl"
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
                className="noir-text inline-flex items-center gap-2 rounded-md px-2 py-1 text-[1rem] text-muted-foreground transition-colors duration-200 hover:bg-accent/40 hover:text-secondary-foreground"
              >
                <Icon className="h-4 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default WorkspaceHeader;
