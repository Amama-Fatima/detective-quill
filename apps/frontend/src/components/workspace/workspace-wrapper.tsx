"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const Workspace = dynamic(
  () => import("./workspace").then((m) => m.Workspace),
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

export default function WorkspaceWrapper() {
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
