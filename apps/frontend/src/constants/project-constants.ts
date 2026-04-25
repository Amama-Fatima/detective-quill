import { LayoutDashboardIcon } from "lucide-react";
import { BlueprintIcon } from "@/components/icons/blueprint-icon";
import { CaseFileIcon } from "@/components/icons/case-file-icon";
import { GraphIcon } from "@/components/icons/graph-icon";
import { VersionControlIcon } from "@/components/icons/version-control-icon";

export const NAV_ITEMS = [
  {
      id: "overview",
      label: "Overview",
      href: `/workspace/123`,
      icon: LayoutDashboardIcon,
      description: "Project at a glance",
  },
  {
    id: "blueprint",
    label: "Blueprints",
    href: `/workspace/123/blueprint`,
    icon: BlueprintIcon,
    description: "Story structure & planning",
  },
  {
    id: "text-editor",
    label: "Manuscript",
    href: `/workspace/123/text-editor`,
    icon: CaseFileIcon,
    description: "Writing & editing",
  },
  {
    id: "visualization",
    label: "Graph Visuals",
    href: `/workspace/123/knowledge-graph`,
    icon: GraphIcon,
    description: "Visual story analysis",
  },
  {
    id: "version-control",
    label: "History",
    href: `/workspace/123/version-control`,
    icon: VersionControlIcon,
    description: "Commit history & version control",
  }
];

export const tab_message = [
  {
    tab: "all",
    title: "Projects",
    description:
      "The detective's desk is empty. Time to start a new investigation!",
  },
  {
    tab: "active",
    title: "Active Projects",
    description:
      "The detective's desk is empty. Time to start a new investigation!",
  },
  {
    tab: "completed",
    title: "Completed Projects",
    description: "No investigations have been solved yet. Time to crack some mysteries!",
  },
  {
    tab: "archived",
    title: "Archived Projects",
    description:
      "No investigations have been archived yet. Your detective work is still ongoing!",
  },
  {
    tab: "invited",
    title: "Invited Projects",
    description:
      "You haven't been invited to any investigations yet. Check back later for new mysteries to solve!",
  },
];