"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const Workspace = dynamic(
  () => import("../../components/workspace/workspace").then((m) => m.Workspace),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="ml-2 text-sm text-muted-foreground">
          {"Loading editor..."}
        </span>
      </div>
    ),
  }
);

// export const metadata = {
//   title: "Markdown Text Editor",
//   description:
//     "An Obsidian-like Markdown editor with file tree and split preview.",
// };

export default function Page() {
  return (
    <main className="min-h-screen">
      <Suspense
        fallback={
          <div className="flex h-[80vh] items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="ml-2 text-sm text-muted-foreground">
              {"Loading editor..."}
            </span>
          </div>
        }
      >
        <Workspace />
      </Suspense>
    </main>
  );
}
