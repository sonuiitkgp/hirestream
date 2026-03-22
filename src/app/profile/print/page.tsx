import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { PrintButton } from "./PrintButton";
import type { FullProfile } from "@/types";
import type { Experience, Project, Internship, AcademicBackground, ExtraCurricular } from "@/generated/prisma/client";

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

function fmt(d: Date | string | null | undefined) {
  if (!d) return "Present";
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default async function ProfilePrintPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const profile = await getProfile(session.user.id);
  if (!profile) redirect("/profile");

  const cc = profile.codechefProfile;

  return (
    <>
      {/* Print trigger + controls — hidden when printing */}
      <div className="no-print flex items-center justify-between border-b bg-background px-6 py-3 print:hidden">
        <span className="text-sm text-muted-foreground">
          Profile preview — use your browser&apos;s print dialog to save as PDF
        </span>
        <PrintButton />
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-6 py-8">
        {/* Header */}
        <div className="border-b pb-4">
          <h1 className="text-2xl font-semibold">{profile.user.name ?? "Unnamed"}</h1>
          {profile.headline && <p className="mt-1 text-sm text-muted-foreground">{profile.headline}</p>}
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
            {profile.location && <span>📍 {profile.location}</span>}
            {profile.linkedin && <a href={profile.linkedin} className="underline">{profile.linkedin}</a>}
            {profile.github && <a href={profile.github} className="underline">{profile.github}</a>}
            {profile.website && <a href={profile.website} className="underline">{profile.website}</a>}
          </div>
          {profile.bio && <p className="mt-3 text-sm">{profile.bio}</p>}
        </div>

        {/* Experience */}
        {profile.experiences.length > 0 && (
          <section>
            <h2 className="mb-3 text-base font-semibold">Work Experience</h2>
            <div className="space-y-4">
              {profile.experiences.map((exp: Experience) => (
                <div key={exp.id}>
                  <div className="flex items-baseline justify-between gap-2">
                    <div>
                      <span className="font-medium">{exp.role}</span>
                      <span className="text-muted-foreground"> · {exp.company}</span>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {fmt(exp.startDate)} – {exp.current ? "Present" : fmt(exp.endDate)}
                    </span>
                  </div>
                  {exp.location && <p className="text-xs text-muted-foreground">{exp.location}</p>}
                  {exp.description && <p className="mt-1 text-sm">{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Internships */}
        {profile.internships.length > 0 && (
          <section>
            <h2 className="mb-3 text-base font-semibold">Internships</h2>
            <div className="space-y-4">
              {profile.internships.map((intern: Internship) => (
                <div key={intern.id}>
                  <div className="flex items-baseline justify-between gap-2">
                    <div>
                      <span className="font-medium">{intern.role}</span>
                      <span className="text-muted-foreground"> · {intern.company}</span>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {fmt(intern.startDate)} – {intern.current ? "Present" : fmt(intern.endDate)}
                    </span>
                  </div>
                  {intern.location && <p className="text-xs text-muted-foreground">{intern.location}</p>}
                  {intern.stipend && <span className="text-xs text-muted-foreground">Stipend: {intern.stipend}</span>}
                  {intern.description && <p className="mt-1 text-sm">{intern.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {profile.projects.length > 0 && (
          <section>
            <h2 className="mb-3 text-base font-semibold">Projects</h2>
            <div className="space-y-4">
              {profile.projects.map((proj: Project) => (
                <div key={proj.id}>
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium">{proj.name}</span>
                    {proj.url && <a href={proj.url} className="text-xs text-primary underline">Live ↗</a>}
                    {proj.repoUrl && <a href={proj.repoUrl} className="text-xs text-primary underline">Repo ↗</a>}
                  </div>
                  {proj.description && <p className="mt-1 text-sm">{proj.description}</p>}
                  {proj.techStack.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {proj.techStack.map((t: string) => (
                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Academic */}
        {profile.academicBgs.length > 0 && (
          <section>
            <h2 className="mb-3 text-base font-semibold">Academic Background</h2>
            <div className="space-y-3">
              {profile.academicBgs.map((acad: AcademicBackground) => (
                <div key={acad.id}>
                  <div className="flex items-baseline justify-between gap-2">
                    <div>
                      <span className="font-medium">{acad.degree} in {acad.field}</span>
                      <span className="text-muted-foreground"> · {acad.institution}</span>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {acad.startYear} – {acad.current ? "Present" : (acad.endYear ?? "—")}
                    </span>
                  </div>
                  {acad.gpa && <span className="text-xs text-muted-foreground">GPA: {acad.gpa}</span>}
                  {acad.description && <p className="mt-1 text-sm">{acad.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Extra Curricular */}
        {profile.extraCurriculars.length > 0 && (
          <section>
            <h2 className="mb-3 text-base font-semibold">Extra Curricular</h2>
            <div className="space-y-2">
              {profile.extraCurriculars.map((ec: ExtraCurricular) => (
                <div key={ec.id}>
                  <span className="font-medium">{ec.activity}</span>
                  {ec.role && <span className="text-muted-foreground"> · {ec.role}</span>}
                  {ec.description && <p className="mt-0.5 text-sm">{ec.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CodeChef */}
        {cc && (
          <section>
            <h2 className="mb-3 text-base font-semibold">CodeChef</h2>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="font-medium">{cc.username}</span>
              {cc.stars && <span>{cc.stars}</span>}
              {cc.rating && <Badge variant="secondary">Rating: {cc.rating}</Badge>}
              {cc.maxRating && <Badge variant="outline">Max: {cc.maxRating}</Badge>}
              {cc.solved && <Badge variant="outline">Solved: {cc.solved}</Badge>}
              {cc.globalRank && <Badge variant="outline">Rank: #{cc.globalRank}</Badge>}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
