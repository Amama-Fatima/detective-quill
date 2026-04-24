import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ProjectsSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function ProjectsSearchInput({
  value,
  onChange,
  placeholder = "Search case files…",
}: ProjectsSearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-60 pl-9 py-2.5
          bg-card border border-border
          case-file text-[12px] tracking-[0.06em] placeholder:text-muted-foreground/60
          focus-visible:ring-0 focus-visible:border-primary
          transition-colors duration-150
        "
      />
    </div>
  );
}
