import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { SuggestionCard } from "@/components/features/suggestions/SuggestionCard";

export default async function SuggestionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) redirect("/profile");

  const suggestions = await db.suggestion.findMany({
    where: { profileId: profile.id },
    include: {
      author: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const pending = suggestions.filter((s) => s.status === "PENDING");
  const resolved = suggestions.filter((s) => s.status !== "PENDING");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Suggestions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review inline edit suggestions from visitors
        </p>
      </div>

      {suggestions.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No suggestions yet. When visitors suggest edits to your profile,
            they&apos;ll appear here.
          </p>
        </div>
      )}

      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Pending ({pending.length})
          </h2>
          {pending.map((s) => (
            <SuggestionCard key={s.id} suggestion={s} />
          ))}
        </div>
      )}

      {resolved.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Resolved ({resolved.length})
          </h2>
          {resolved.map((s) => (
            <SuggestionCard key={s.id} suggestion={s} />
          ))}
        </div>
      )}
    </div>
  );
}
