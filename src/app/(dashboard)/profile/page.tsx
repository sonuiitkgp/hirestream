import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ProfileTabs } from "@/components/features/profile/ProfileTabs";
import { ProfileHeader } from "@/components/features/profile/ProfileHeader";
import { SuggestionBadge } from "@/components/features/suggestions/SuggestionBadge";
import type { FullProfile } from "@/types";

async function getProfile(userId: string): Promise<FullProfile | null> {
  return db.profile.findUnique({
    where: { userId },
    include: {
      user: { select: { id: true, name: true, email: true, image: true, role: true } },
      experiences: { orderBy: { startDate: "desc" } },
      projects: { orderBy: { createdAt: "desc" } },
      internships: { orderBy: { startDate: "desc" } },
      academicBgs: { orderBy: { startYear: "desc" } },
      extraCurriculars: true,
      codechefProfile: true,
    },
  });
}

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "JOB_SEEKER" && session.user.role !== "ADMIN") {
    redirect("/recruiter/search");
  }

  let profile = await getProfile(session.user.id);

  // Auto-create profile if missing (edge case)
  if (!profile) {
    await db.profile.create({ data: { userId: session.user.id } });
    profile = await getProfile(session.user.id);
  }

  if (!profile) redirect("/login");

  // Fetch suggestions for this profile
  const suggestions = await db.suggestion.findMany({
    where: { profileId: profile.id },
    include: {
      author: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6 lg:p-8">
      <ProfileHeader profile={profile} />
      <SuggestionBadge suggestions={suggestions} />
      <ProfileTabs profile={profile} />
    </div>
  );
}
