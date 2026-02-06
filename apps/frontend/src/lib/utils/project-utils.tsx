import { Target, Star, Archive, Clock } from "lucide-react";

export const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-accent text-accent-foreground";
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "archived":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <Target className="h-3 w-3" />;
    case "completed":
      return <Star className="h-3 w-3" />;
    case "archived":
      return <Archive className="h-3 w-3" />;
    default:
      return <Clock className="h-3 w-3" />;
  }
};
