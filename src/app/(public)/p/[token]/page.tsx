import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { GitBranch, Globe, Link2, MapPin, MessageCircle } from "lucide-react";
import { MessageProfileButton } from "@/components/features/messaging/MessageProfileButton";
import { Badge } from "@/components/ui/badge";
import { TextSelectionSuggest } from "@/components/features/suggestions/TextSelectionSuggest";
import { SuggestionIndicator } from "@/components/features/suggestions/SuggestionIndicator";
import { SubSectionComment } from "@/components/features/public/SubSectionComment";
import {
  ProfileFeedbackProvider,
  type FeedbackItem,
} from "@/components/features/public/ProfileFeedbackContext";
import { FeedbackSidebar } from "@/components/features/public/FeedbackSidebar";
import { MarkdownDescription } from "@/components/ui/markdown-description";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const [session, profile] = await Promise.all([
    auth(),
    db.profile.findUnique({
      where: { shareToken: token },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        experiences: { orderBy: { startDate: "desc" } },
        projects: { orderBy: { createdAt: "desc" } },
        internships: { orderBy: { startDate: "desc" } },
        academicBgs: { orderBy: { startYear: "desc" } },
        extraCurriculars: true,
        codechefProfile: true,
      },
    }),
  ]);

  if (!profile || profile.visibility === "HIDDEN") notFound();
  if (profile.visibility === "PRIVATE" && !session) notFound();

  const initials = (profile.user.name ?? profile.user.email ?? "U")
    .split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const isOwner = session?.user?.id === profile.user.id;
  const canSuggest = !!session && !isOwner;

  // Fetch pending suggestions for indicators
  const suggestions = canSuggest || isOwner
    ? await db.suggestion.findMany({
        where: { profileId: profile.id, status: "PENDING" },
        include: { author: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  // Fetch current user's own suggestions + comments on this profile (for sidebar)
  const [mySuggestions, myComments] = session?.user?.id && !isOwner
    ? await Promise.all([
        db.suggestion.findMany({
          where: { profileId: profile.id, authorId: session.user.id },
          orderBy: { createdAt: "desc" },
        }),
        db.comment.findMany({
          where: { profileId: profile.id, authorId: session.user.id, parentId: null },
          orderBy: { createdAt: "desc" },
        }),
      ])
    : [[], []];

  // Build unified feedback items for sidebar
  const feedbackItems: FeedbackItem[] = [
    ...mySuggestions.map((s) => ({
      id: s.id,
      kind: "suggestion" as const,
      sectionType: s.sectionType,
      fieldName: s.fieldName,
      sectionItemId: s.sectionItemId ?? undefined,
      originalText: s.originalText,
      suggestedText: s.suggestedText,
      status: s.status,
      createdAt: s.createdAt.toISOString(),
    })),
    ...myComments.map((c) => {
      // Derive sectionItemId from the specific FK fields
      const itemId =
        c.experienceId ?? c.projectId ?? c.internshipId ??
        c.academicId ?? c.extraCurId ?? c.codechefId ?? undefined;
      return {
        id: c.id,
        kind: "comment" as const,
        sectionType: c.sectionType,
        sectionItemId: itemId ?? undefined,
        content: c.content,
        status: c.status,
        createdAt: c.createdAt.toISOString(),
      };
    }),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const hasSidebar = canSuggest;

  function suggestionsFor(sectionType: string, fieldName: string, itemId?: string) {
    return suggestions.filter(
      (s) =>
        s.sectionType === sectionType &&
        s.fieldName === fieldName &&
        (itemId ? s.sectionItemId === itemId : true)
    );
  }

  function validUrl(val: string | null | undefined): string | null {
    const s = val?.trim();
    if (!s || s.toLowerCase() === "not provided") return null;
    if (s.startsWith("http://") || s.startsWith("https://")) return s;
    if (s.includes(".")) return `https://${s}`;
    return null;
  }
  const linkedin = validUrl(profile.linkedin);
  const github = validUrl(profile.github);
  const website = validUrl(profile.website);

  const content = (
    <div className="flex">
      {/* Main content — shifts left when sidebar is open */}
      <div className={`flex-1 min-w-0 transition-all duration-300 ${hasSidebar ? "lg:mr-[272px]" : ""}`}>
        <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6 lg:p-8">

          {/* Owner banner */}
          {isOwner && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 flex items-center justify-between">
              <p className="text-sm text-primary">This is how others see your profile.</p>
              <a href="/profile" className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                Edit Profile
              </a>
            </div>
          )}

          {/* Hero header */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-end gap-5">
              <div className="relative shrink-0">
                <div className="relative h-20 w-20 rounded-full bg-primary/10 ring-1 ring-border flex items-center justify-center text-primary text-xl font-bold">
                  {initials}
                </div>
              </div>
              <div className="mb-1 min-w-0 pb-1">
                <h1 className="text-2xl font-bold text-foreground">
                  {profile.user.name ?? "Anonymous"}
                </h1>
                {profile.headline && (
                  <p className="mt-0.5 text-sm text-muted-foreground">{profile.headline}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {profile.location && (
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{profile.location}</span>
                  )}
                  {linkedin && (
                    <a href={linkedin} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 border border-border hover:bg-muted rounded-md px-2 py-0.5 transition-colors">
                      <Link2 className="h-3 w-3" /> LinkedIn
                    </a>
                  )}
                  {github && (
                    <a href={github} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 border border-border hover:bg-muted rounded-md px-2 py-0.5 transition-colors">
                      <GitBranch className="h-3 w-3" /> GitHub
                    </a>
                  )}
                  {website && (
                    <a href={website} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 border border-border hover:bg-muted rounded-md px-2 py-0.5 transition-colors">
                      <Globe className="h-3 w-3" /> Website
                    </a>
                  )}
                  {canSuggest && (
                    <MessageProfileButton userId={profile.user.id} userName={profile.user.name ?? "this user"} />
                  )}
                </div>
              </div>
            </div>
            {profile.bio && (
              <div className="mt-4 rounded-lg bg-muted px-4 py-3">
                {canSuggest ? (
                  <TextSelectionSuggest profileId={profile.id} sectionType="EXPERIENCE" fieldName="bio" fullText={profile.bio} />
                ) : (
                  <p className="text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>
                )}
                <SuggestionIndicator suggestions={suggestionsFor("EXPERIENCE", "bio")} />
              </div>
            )}
          </div>

          {/* Experience */}
          {profile.experiences.length > 0 && (
            <div className="section-clean space-y-4">
              <h2 className="text-base font-semibold">Experience</h2>
              <div className="space-y-3">
                {profile.experiences.map((e) => {
                  const card = (
                    <div className="card-clean p-4">
                      <div className="font-semibold">{e.role}</div>
                      <div className="text-sm text-muted-foreground">{e.company}{e.location ? ` · ${e.location}` : ""}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {new Date(e.startDate).getFullYear()} – {e.current ? "Present" : e.endDate ? new Date(e.endDate).getFullYear() : ""}
                      </div>
                      {e.description && (
                        <div className="mt-2">
                          {canSuggest ? (
                            <TextSelectionSuggest profileId={profile.id} sectionType="EXPERIENCE" sectionItemId={e.id} fieldName="description" fullText={e.description} />
                          ) : (
                            <MarkdownDescription content={e.description} />
                          )}
                          <SuggestionIndicator suggestions={suggestionsFor("EXPERIENCE", "description", e.id)} />
                        </div>
                      )}
                    </div>
                  );
                  return canSuggest ? (
                    <SubSectionComment key={e.id} profileId={profile.id} sectionType="EXPERIENCE" sectionItemId={e.id} itemLabel={`${e.role} at ${e.company}`}>
                      {card}
                    </SubSectionComment>
                  ) : <div key={e.id}>{card}</div>;
                })}
              </div>
            </div>
          )}

          {/* Projects */}
          {profile.projects.length > 0 && (
            <div className="section-clean space-y-4">
              <h2 className="text-base font-semibold">Projects</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {profile.projects.map((p) => {
                  const card = (
                    <div className="card-clean p-4">
                      <div className="font-semibold">{p.name}</div>
                      {p.description && (
                        <div className="mt-1">
                          {canSuggest ? (
                            <TextSelectionSuggest profileId={profile.id} sectionType="PROJECT" sectionItemId={p.id} fieldName="description" fullText={p.description} />
                          ) : (
                            <MarkdownDescription content={p.description} />
                          )}
                          <SuggestionIndicator suggestions={suggestionsFor("PROJECT", "description", p.id)} />
                        </div>
                      )}
                      {p.techStack.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {p.techStack.map((t) => (
                            <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                  return canSuggest ? (
                    <SubSectionComment key={p.id} profileId={profile.id} sectionType="PROJECT" sectionItemId={p.id} itemLabel={p.name}>
                      {card}
                    </SubSectionComment>
                  ) : <div key={p.id}>{card}</div>;
                })}
              </div>
            </div>
          )}

          {/* Internships */}
          {profile.internships.length > 0 && (
            <div className="section-clean space-y-4">
              <h2 className="text-base font-semibold">Internships</h2>
              <div className="space-y-3">
                {profile.internships.map((i) => {
                  const card = (
                    <div className="card-clean p-4">
                      <div className="font-semibold">{i.role}</div>
                      <div className="text-sm text-muted-foreground">{i.company}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {new Date(i.startDate).getFullYear()} – {i.current ? "Present" : i.endDate ? new Date(i.endDate).getFullYear() : ""}
                      </div>
                      {i.description && (
                        <div className="mt-2">
                          {canSuggest ? (
                            <TextSelectionSuggest profileId={profile.id} sectionType="INTERNSHIP" sectionItemId={i.id} fieldName="description" fullText={i.description} />
                          ) : (
                            <MarkdownDescription content={i.description} />
                          )}
                          <SuggestionIndicator suggestions={suggestionsFor("INTERNSHIP", "description", i.id)} />
                        </div>
                      )}
                    </div>
                  );
                  return canSuggest ? (
                    <SubSectionComment key={i.id} profileId={profile.id} sectionType="INTERNSHIP" sectionItemId={i.id} itemLabel={`${i.role} at ${i.company}`}>
                      {card}
                    </SubSectionComment>
                  ) : <div key={i.id}>{card}</div>;
                })}
              </div>
            </div>
          )}

          {/* Education */}
          {profile.academicBgs.length > 0 && (
            <div className="section-clean space-y-4">
              <h2 className="text-base font-semibold">Education</h2>
              <div className="space-y-3">
                {profile.academicBgs.map((a) => {
                  const card = (
                    <div className="card-clean p-4">
                      <div className="font-semibold">{a.degree} in {a.field}</div>
                      <div className="text-sm text-muted-foreground">{a.institution}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {a.startYear} – {a.current ? "Present" : a.endYear ?? ""}
                        {a.gpa ? ` · GPA ${a.gpa}` : ""}
                      </div>
                    </div>
                  );
                  return canSuggest ? (
                    <SubSectionComment key={a.id} profileId={profile.id} sectionType="ACADEMIC" sectionItemId={a.id} itemLabel={`${a.degree} at ${a.institution}`}>
                      {card}
                    </SubSectionComment>
                  ) : <div key={a.id}>{card}</div>;
                })}
              </div>
            </div>
          )}

          {/* Extra Curriculars */}
          {profile.extraCurriculars.length > 0 && (
            <div className="section-clean space-y-4">
              <h2 className="text-base font-semibold">Extra Curricular</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {profile.extraCurriculars.map((ec) => {
                  const card = (
                    <div className="card-clean p-4">
                      <div className="font-semibold">{ec.activity}</div>
                      {ec.role && <div className="text-sm text-muted-foreground">{ec.role}</div>}
                      {ec.description && (
                        <div className="mt-1">
                          {canSuggest ? (
                            <TextSelectionSuggest profileId={profile.id} sectionType="EXTRA_CURRICULAR" sectionItemId={ec.id} fieldName="description" fullText={ec.description} />
                          ) : (
                            <MarkdownDescription content={ec.description} />
                          )}
                          <SuggestionIndicator suggestions={suggestionsFor("EXTRA_CURRICULAR", "description", ec.id)} />
                        </div>
                      )}
                    </div>
                  );
                  return canSuggest ? (
                    <SubSectionComment key={ec.id} profileId={profile.id} sectionType="EXTRA_CURRICULAR" sectionItemId={ec.id} itemLabel={ec.activity}>
                      {card}
                    </SubSectionComment>
                  ) : <div key={ec.id}>{card}</div>;
                })}
              </div>
            </div>
          )}

          {/* CodeChef */}
          {profile.codechefProfile && (
            <div className="section-clean space-y-4">
              <h2 className="text-base font-semibold">CodeChef</h2>
              <div className="card-clean p-4">
                <div className="flex items-center gap-3">
                  <div className="font-semibold">{profile.codechefProfile.username}</div>
                  {profile.codechefProfile.rating && (
                    <Badge variant="secondary">Rating: {profile.codechefProfile.rating}</Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Additional Info (misc) */}
          {(() => {
            const miscSections = (
              (profile.miscData as { title: string; items: string[] }[] | null) ?? []
            ).filter((s) => s.items && s.items.filter((item) => item.trim()).length > 0);
            if (miscSections.length === 0) return null;
            return (
              <div className="section-clean space-y-4">
                <h2 className="text-base font-semibold">Additional Info</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {miscSections.map((section, i) => (
                    <div key={i} className="card-clean p-4">
                      <div className="font-semibold text-sm mb-2">{section.title}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {section.items.filter((item) => item.trim()).map((item, j) => (
                          <span key={j} className="inline-flex items-center rounded-full bg-muted text-foreground px-2.5 py-0.5 text-xs font-medium">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {!session && (
            <p className="text-center text-xs text-muted-foreground pb-4">
              <a href="/login" className="text-primary hover:underline">Sign in</a> to suggest edits and leave comments
            </p>
          )}
        </div>
      </div>

      {/* Right sidebar — user's feedback (suggestions + comments) */}
      {hasSidebar && <FeedbackSidebar />}
    </div>
  );

  // Wrap with context provider for authenticated non-owners
  if (canSuggest) {
    return (
      <ProfileFeedbackProvider initialItems={feedbackItems}>
        {content}
      </ProfileFeedbackProvider>
    );
  }

  return content;
}
