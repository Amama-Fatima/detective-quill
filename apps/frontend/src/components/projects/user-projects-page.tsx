"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { Project } from "@detective-quill/shared-types";
import CreateProjectDialog from "@/components/projects/create-project-dialog";
import ProjectsDisplay from "./projects-display";
import ProjectsSearchInput from "./projects-search-input";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

type FilterOption = "all" | "active" | "completed" | "archived" | "invited";

interface ProjectsPageClientProps {
  initialProjects: Project[];
  invitedProjects?: Project[];
}

export default function UserProjectsPage({
  initialProjects,
  invitedProjects = [],
}: ProjectsPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([
    ...initialProjects,
    ...invitedProjects,
  ]);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<FilterOption>("all");

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const matchesSearch = (project: Project) => {
    if (!normalizedSearch) return true;
    const title = project.title?.toLowerCase() ?? "";
    const description = project.description?.toLowerCase() ?? "";
    return (
      title.includes(normalizedSearch) ||
      description.includes(normalizedSearch) ||
      project.status.toLowerCase().includes(normalizedSearch)
    );
  };

  const filteredProjects = useMemo(
    () => projects.filter(matchesSearch),
    [projects, normalizedSearch],
  );

  const activeProjects = useMemo(
    () => filteredProjects.filter((p) => p.status === "active"),
    [filteredProjects],
  );

  const completedProjects = useMemo(
    () => filteredProjects.filter((p) => p.status === "completed"),
    [filteredProjects],
  );

  const archivedProjects = useMemo(
    () => filteredProjects.filter((p) => p.status === "archived"),
    [filteredProjects],
  );

  const filteredInvitedProjects = useMemo(
    () => invitedProjects.filter(matchesSearch),
    [invitedProjects, normalizedSearch],
  );

  useEffect(() => {
    const initialFilter = (searchParams.get("tab") as FilterOption) || "all";
    if (
      ["all", "active", "completed", "archived", "invited"].includes(
        initialFilter,
      )
    ) {
      setFilter(initialFilter);
    }
  }, [searchParams]);

  const updateTabUrl = (tab: FilterOption) => {
    if (tab === "all") {
      router.replace(pathname);
      return;
    }
    if (tab === searchParams.get("tab")) return;
    router.replace(`${pathname}?tab=${tab}`);
  };

  const totalCount = filteredProjects.length + filteredInvitedProjects.length;

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* ── Dot-grid texture (matches landing page) ── */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[radial-gradient(oklch(24%_0.022_245)_1px,transparent_1px)] bg-[size:28px_28px]" />

      {/* ── Decorative blobs ── */}
      <div className="pointer-events-none absolute -right-24 top-16 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-32 h-64 w-64 rounded-full bg-primary/8 blur-3xl" />

      {/* ════════════════════════════════════════════
          HEADER BANNER
      ════════════════════════════════════════════ */}
      <header className="relative border-b border-border bg-card/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-7">
          <div className="flex flex-wrap items-center justify-between gap-5">
            {/* Left: eyebrow + title */}
            <div>
              <p className="case-file text-xs text-muted-foreground mb-1 tracking-[0.14em]">
                Detective&apos;s Quill — Case Registry
              </p>
              <h1 className="font-playfair-display text-[clamp(26px,4vw,40px)] font-bold leading-none tracking-[-0.02em] text-primary">
                My Investigations
              </h1>
              <p className="noir-text text-sm text-muted-foreground mt-1.5">
                {totalCount > 0
                  ? `${totalCount} case ${totalCount === 1 ? "file" : "files"} on record`
                  : "No cases on record yet"}
              </p>
            </div>

            {/* Right: CTA */}
            <Button
              onClick={() => setShowCreateDialog(true)}
              size="lg"
              className="
                bg-primary text-primary-foreground
                font-playfair-display text-[15px] tracking-[0.02em]
                px-7 py-5
                shadow-[0_4px_20px_oklch(24%_0.022_245/0.22)]
                hover:-translate-y-[2px] hover:bg-secondary-foreground
                transition-all duration-200
                cursor-pointer
              "
            >
              <Plus className="h-4 w-4 mr-2" />
              Open New Case
            </Button>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════
          BODY — two-column layout on lg+
      ════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">
          {/* ── LEFT SIDEBAR: Detective illustration ── */}
          <aside className="hidden lg:flex flex-col items-center gap-4 w-50 shrink-0 sticky top-10 self-start">
            {/* Lottie animation */}
            <div className="w-45 h-45">
              <DotLottieReact src="/Mr Detective.lottie" loop autoplay />
            </div>

            {/* Flavour text below animation */}
            <div className="w-full border-t border-border pt-4">
              <p className="case-file text-[10px] text-muted-foreground tracking-[0.12em] text-center leading-relaxed">
                ACTIVE INVESTIGATOR
              </p>
              <p className="noir-text text-xs text-center text-muted-foreground mt-1 italic">
                &ldquo;Every story starts
                <br />
                with a single clue.&rdquo;
              </p>
            </div>

            {/* Stats mini-panel */}
            <div className="w-full border border-border bg-card mt-1">
              {[
                { label: "Active", count: activeProjects.length },
                { label: "Completed", count: completedProjects.length },
                { label: "Archived", count: archivedProjects.length },
              ].map(({ label, count }, i) => (
                <div
                  key={label}
                  className={`flex items-center justify-between px-4 py-2.5 ${
                    i !== 2 ? "border-b border-border/50" : ""
                  }`}
                >
                  <span className="case-file text-[10px] text-muted-foreground tracking-[0.1em]">
                    {label}
                  </span>
                  <span className="font-mono text-sm font-bold text-primary">
                    {String(count).padStart(2, "0")}
                  </span>
                </div>
              ))}
            </div>
          </aside>

          {/* ── RIGHT: Tabs + project list ── */}
          <main className="flex-1 min-w-0">
            <Tabs
              value={filter}
              onValueChange={(value) => {
                setFilter(value as FilterOption);
                updateTabUrl(value as FilterOption);
              }}
            >
              {/* Tab bar + search */}
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mb-6">
                <TabsList className="bg-card border border-border h-auto p-0 gap-0">
                  {(
                    [
                      "all",
                      "active",
                      "completed",
                      "archived",
                      "invited",
                    ] as FilterOption[]
                  ).map((tab, i, arr) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className={`
                        case-file text-[11px] tracking-[0.1em] uppercase
                        px-4 py-2.5 cursor-pointer
                        data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                        ${i !== arr.length - 1 ? "border-r border-border/60" : ""}
                        transition-colors duration-150
                      `}
                    >
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <ProjectsSearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                />
              </div>

              <TabsContent value="all">
                <ProjectsDisplay projects={filteredProjects} />
              </TabsContent>
              <TabsContent value="active">
                <ProjectsDisplay projects={activeProjects} />
              </TabsContent>
              <TabsContent value="completed">
                <ProjectsDisplay projects={completedProjects} />
              </TabsContent>
              <TabsContent value="archived">
                <ProjectsDisplay projects={archivedProjects} />
              </TabsContent>
              <TabsContent value="invited">
                <ProjectsDisplay projects={filteredInvitedProjects} />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        setProjects={setProjects}
      />
    </div>
  );
}
