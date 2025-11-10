import { Fingerprint, Map, FileText, BarChart3 } from "lucide-react";

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

// Get current path to determine active tab
const getCurrentTab = () => {
  if (typeof window !== "undefined") {
    const path = window.location.pathname;
    if (path.includes("/blueprint")) return "blueprint";
    if (path.includes("/text-editor")) return "text-editor";
    if (path.includes("/visualization")) return "visualization";
    return "main";
  }
  return "main";
};
