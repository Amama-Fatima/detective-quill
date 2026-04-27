// import { useState, useRef, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Project } from "@detective-quill/shared-types";
// import { Badge } from "../ui/badge";
// import Link from "next/link";
// import { getStatusColor, getStatusIcon } from "@/lib/utils/project-utils";
// import { CaseFileIcon } from "@/components/icons/case-file-icon";
// import { ClockIcon } from "../icons/clock-icon";
// import { CornerOrnamentIcon } from "@/components/icons/corner-ornament-icon";
// import { formatDate } from "date-fns";

// interface ProjectCardProps {
//   project: Project;
// }

// export default function ProjectCard({ project }: ProjectCardProps) {
//   const [isVisible, setIsVisible] = useState(false);
//   const cardRef = useRef(null);

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) {
//           setIsVisible(true);
//           observer.disconnect();
//         }
//       },
//       { threshold: 0.1 },
//     );

//     if (cardRef.current) {
//       observer.observe(cardRef.current);
//     }

//     return () => observer.disconnect();
//   }, []);

//   const formattedUpdatedAt = project.updated_at
//     ? formatDate(new Date(project.updated_at), "PPP")
//     : "Unknown date";

//   return (
//     <div ref={cardRef} className="h-full">
//       {isVisible ? (
//         <Card className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-sm border-border bg-card shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
//           <div className="pointer-events-none absolute left-0 top-1 text-border/70">
//             <CornerOrnamentIcon className="h-11 w-11 translate-x-0.5 -translate-y-0.5" />
//           </div>
//           <div className="pointer-events-none absolute bottom-1 right-0 text-border/70">
//             <CornerOrnamentIcon className="h-11 w-11 -translate-x-0.5 translate-y-0.5 rotate-180" />
//           </div>

//           <CardHeader className="pb-3">
//             <div className="flex items-start justify-between">
//               <div className="flex items-center space-x-3">
//                 <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
//                   <CaseFileIcon />
//                 </div>
//                 <div className="flex-1">
//                   <CardTitle className="font-serif text-xl group-hover:text-primary transition-colors line-clamp-1">
//                     <Link href={`/workspace/${project.id}`}>
//                       {project.title}
//                     </Link>
//                   </CardTitle>
//                   <Badge
//                     className={`text-xs case-file mt-1 ${getStatusColor(
//                       project.status,
//                     )}`}
//                   >
//                     {getStatusIcon(project.status)}
//                     <span className="ml-1">{project.status.toUpperCase()}</span>
//                   </Badge>
//                 </div>
//               </div>
//             </div>
//           </CardHeader>

//           <CardContent className="pt-0">
//             <p className="text-sm text-muted-foreground noir-text text-[1rem] mb-4 line-clamp-2 italic min-h-[70px]">
//               {project.description || "No case summary available..."}
//             </p>

//             <div className="noir-text space-y-3">
//               <div className="flex items-center justify-between text-xs text-muted-foreground">
//                 <div className="flex items-center gap-2">
//                   <ClockIcon />
//                   {formattedUpdatedAt}
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       ) : (
//         <div className="h-[220px] bg-muted/20 rounded-lg animate-pulse" />
//       )}
//     </div>
//   );
// }
