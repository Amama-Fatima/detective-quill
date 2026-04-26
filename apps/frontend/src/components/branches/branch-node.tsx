"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Branch } from "@detective-quill/shared-types";
import { CornerOrnamentIcon } from "../icons/corner-ornament-icon";

type BranchWithParent = Branch & { parent_branch_id: string | null };

interface BranchNodeProps {
  branch: BranchWithParent;
  projectId: string;
  index: number;
  isLast: boolean;
  isSwitching: boolean;
  onSwitch: (branchId: string) => void;
  depth: number;
  hasChildren: boolean;
}

export default function BranchNode({
  branch,
  projectId,
  index,
  isLast,
  isSwitching,
  onSwitch,
  depth,
  hasChildren,
}: BranchNodeProps) {
  const isActive = branch.is_active;
  const isDefault = branch.is_default;
  const isRoot = depth === 0;

  return (
    <div className="flex gap-0">
      {/* ── Git track column ── */}
      <div className="flex flex-col items-center w-10 shrink-0">
        {/* Line above node */}
        <div
          className={`w-px flex-none ${isRoot && index === 0 ? "h-3" : "h-6"} ${
            isActive ? "bg-primary" : "bg-border/60"
          }`}
        />

        {/* Node dot */}
        <div
          className={`
            relative z-10 flex items-center justify-center
            w-5 h-5 rounded-full border-2 shrink-0
            transition-all duration-500
            ${
              isActive
                ? "border-primary bg-primary shadow-[0_0_12px_oklch(24%_0.022_245/0.5)]"
                : "border-border/70 bg-background"
            }
          `}
        >
          {isActive && (
            <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
          )}
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              isActive ? "bg-primary-foreground" : "bg-muted-foreground/50"
            }`}
          />
        </div>

        {/* Line below node — continues if not last or has children */}
        <div
          className={`w-px flex-1 min-h-6 transition-colors duration-500 ${
            isLast && !hasChildren ? "opacity-0" : ""
          } ${isActive ? "bg-primary/40" : "bg-border/40"}`}
        />
      </div>

      {/* ── Branch card ── */}
      <div className="pb-4 flex-1 pt-0.5">
        <div
          className={`
            relative border bg-card transition-all duration-300
            hover:bg-accent/10
            ${isActive ? "border-primary/50 border-l-2" : "border-border"}
          `}
        >
          {/* Corner ornaments */}
          <div className="pointer-events-none absolute left-0 top-1 text-border/50">
            <CornerOrnamentIcon className="h-8 w-8 translate-x-0.5 -translate-y-0.5" />
          </div>
          <div className="pointer-events-none absolute bottom-1 right-0 text-border/50">
            <CornerOrnamentIcon className="h-8 w-8 -translate-x-0.5 translate-y-0.5 rotate-180" />
          </div>

          <div className="px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="case-file text-[10px] text-muted-foreground/60 mb-1 tracking-[0.1em]">
                {isRoot ? "Root" : `Depth ${depth}`} · Branch #{String(index + 1).padStart(3, "0")}
              </p>

              <Link
                href={`/workspace/${projectId}/version-control/${branch.id}`}
                className="group"
              >
                <p className="font-playfair-display italic text-[20px] font-bold text-foreground truncate group-hover:text-primary transition-colors duration-150">
                  {branch.name}
                </p>
              </Link>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isDefault && (
                <span className="case-file text-[10px] tracking-[0.1em] uppercase px-2.5 py-1 border border-border/60 text-muted-foreground bg-muted/40">
                  Default
                </span>
              )}
              {isActive ? (
                <span className="case-file text-[10px] tracking-[0.1em] uppercase px-2.5 py-1 bg-primary text-primary-foreground">
                  Active
                </span>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="cursor-pointer case-file text-[10px] tracking-[0.08em] uppercase rounded-none border-border/60 hover:border-primary hover:text-primary transition-colors"
                  disabled={isSwitching}
                  onClick={() => onSwitch(branch.id)}
                >
                  {isSwitching ? "Switching…" : "Switch"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}