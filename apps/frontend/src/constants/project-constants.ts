import { Map, FileText, BarChart3 } from "lucide-react";

export const NAV_ITEMS = [
  {
    id: "blueprint",
    label: "Case Blueprint",
    href: `/workspace/123/blueprint`,
    icon: Map,
    description: "Story structure & planning",
  },
  {
    id: "text-editor",
    label: "Case Files",
    href: `/workspace/123/text-editor`,
    icon: FileText,
    description: "Writing & editing",
  },
  {
    id: "visualization",
    label: "Case Visuals",
    href: `/workspace/123/visualization`,
    icon: BarChart3,
    description: "Visual story analysis",
  },
  {
    id: "version-control",
    label: "Case History",
    href: `/workspace/123/version-control`,
    icon: BarChart3,
    description: "Visual story analysis",
  },
];

export const tab_message = [
  {
    tab: "all",
    title: "Cases",
    description:
      "The detective's desk is empty. Time to start a new investigation!",
  },
  {
    tab: "active",
    title: "Active Cases",
    description:
      "The detective's desk is empty. Time to start a new investigation!",
  },
  {
    tab: "completed",
    title: "Completed Cases",
    description: "No cases have been solved yet. Time to crack some mysteries!",
  },
  {
    tab: "archived",
    title: "Archived Cases",
    description:
      "No cases have been archived yet. Your detective work is still ongoing!",
  },
  {
    tab: "invited",
    title: "Invited Cases",
    description:
      "You haven't been invited to any cases yet. Check back later for new mysteries to solve!",
  },
];