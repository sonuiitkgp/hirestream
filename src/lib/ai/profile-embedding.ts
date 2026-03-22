import { db } from "@/lib/db";
import { embedProfile } from "./embeddings";

export async function generateProfileEmbedding(profileId: string): Promise<void> {
  try {
    const profile = await db.profile.findUnique({
      where: { id: profileId },
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
    if (!profile) return;
    const vector = await embedProfile(profile as any);
    const vectorStr = `[${vector.join(",")}]`;
    await (db as any).$executeRawUnsafe(
      `UPDATE "Profile" SET embedding = $1::vector WHERE id = $2`,
      vectorStr,
      profileId
    );
  } catch {
    // Non-fatal — embedding generation is best-effort
  }
}
