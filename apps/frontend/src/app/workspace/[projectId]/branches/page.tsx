import React from "react";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { redirect } from "next/navigation";

import { notFound } from "next/navigation";
import { getUserFromCookie } from "@/lib/utils/get-user";
import { getProjectStatusAndAuthor } from "@/lib/supabase-calls/user-projects";
import { getBranchesOfProject } from "@/lib/supabase-calls/branches";
import BranchesDropdown from "@/components/editor-workspace/branches/branches-dropdown";

interface BranchesPageProps {
  params: {
    projectId: string;
  };
}

const BranchesPage = async ({ params }: BranchesPageProps) => {
  const supabase = await createSupabaseServerClient();

  const { projectId } = await params;

  const user = await getUserFromCookie();

  if (!user || !user.sub) {
    redirect("/auth/sign-in");
  }

  // todo: make this a context provider if used in multiple places
  const { isActive, author_id } = await getProjectStatusAndAuthor(
    projectId,
    supabase,
  );

  const { branches, error } = await getBranchesOfProject(projectId, supabase);

  if (!branches || error) {
    notFound();
  }

  return (
    <div>
      <BranchesDropdown branches={branches} />
    </div>
  );
};

export default BranchesPage;
