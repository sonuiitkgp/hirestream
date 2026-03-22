import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ProfileSettingsForm } from "@/components/features/profile/ProfileSettingsForm";

export default async function ProfileSettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "JOB_SEEKER" && session.user.role !== "ADMIN") {
    redirect("/recruiter/search");
  }

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      headline: true,
      bio: true,
      location: true,
      website: true,
      linkedin: true,
      github: true,
      visibility: true,
    },
  });

  if (!profile) redirect("/profile");

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Profile Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile visibility and personal information.
        </p>
      </div>
      <ProfileSettingsForm profile={profile} />
    </div>
  );
}
