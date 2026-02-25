import UserProfile from "@/components/profile/user-profile";
import Heatmap from "@/components/profile/heatmap";
import { getUserFromCookie } from "@/lib/utils/get-user";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const user = await getUserFromCookie();

  if (!user || !user.sub) {
    redirect("/auth/sign-in");
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-6">
      <UserProfile />
      <Heatmap />
    </section>
  );
}
