import { redirect } from "next/navigation";

export default function WorkspacePage() {
  // Redirect to a default project or show project selection
  redirect("/workspace/default-project");
}
