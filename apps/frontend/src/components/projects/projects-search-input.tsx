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
  placeholder = "Search your projects...",
}: ProjectsSearchInputProps) {
  return (
    <div className="relative z-10 flex items-center gap-3">
      <div className="relative border rounded-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-64 bg-card/50 pl-10"
        />
      </div>
    </div>
  );
}
