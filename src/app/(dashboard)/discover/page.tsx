import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DiscoverSearch } from "@/components/features/discover/DiscoverSearch";
import { Compass } from "lucide-react";

export default async function DiscoverPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Compass className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Discover People</h1>
          <p className="text-xs text-muted-foreground">Find profiles similar to yours, or search by skills and interests</p>
        </div>
      </div>
      <DiscoverSearch currentUserId={session.user.id} />
    </div>
  );
}
