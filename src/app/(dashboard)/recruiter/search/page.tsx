import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SearchBar } from "@/components/features/recruiter/SearchBar";

export default async function RecruiterSearchPage() {
  const session = await auth();
  if (!session || (session.user.role !== "RECRUITER" && session.user.role !== "ADMIN")) {
    redirect("/profile");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-semibold">Search Talent</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Use natural language to find candidates. Our AI ranks profiles by relevance.
        </p>
      </div>
      <SearchBar />
    </div>
  );
}
