import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText, Clock } from "lucide-react";
import { Project } from "@detective-quill/shared-types";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { getStatusColor, getStatusIcon } from "@/lib/utils/project-utils";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={cardRef}>
      {isVisible ? (
        <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-border hover:-translate-y-2 bg-card shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="font-serif text-xl group-hover:text-primary transition-colors line-clamp-1">
                    <Link href={`/workspace/${project.id}`}>
                      {project.title}
                    </Link>
                  </CardTitle>
                  <Badge
                    className={`text-xs case-file mt-1 ${getStatusColor(
                      project.status,
                    )}`}
                  >
                    {getStatusIcon(project.status)}
                    <span className="ml-1">{project.status.toUpperCase()}</span>
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground noir-text text-[1rem] mb-4 line-clamp-2">
              {project.description || "No case summary available..."}
            </p>

            <div className="noir-text space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <FileText className="h-3 w-3 mr-1" />
                    Word Count words
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="h-3 w-3 mr-1" />
                    Chapter number chapters
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {project.updated_at}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="h-[220px] bg-muted/20 rounded-lg animate-pulse" />
      )}
    </div>
  );
}
