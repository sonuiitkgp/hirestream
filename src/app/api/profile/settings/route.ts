import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateProfileEmbedding } from "@/lib/ai/profile-embedding";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await db.profile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { name, visibility, headline, bio, location, website, linkedin, github } = await req.json();

  const VALID_VISIBILITY = ["PUBLIC", "PRIVATE", "HIDDEN"];
  if (visibility && !VALID_VISIBILITY.includes(visibility)) {
    return NextResponse.json({ error: "Invalid visibility value." }, { status: 400 });
  }

  // Update user name if provided
  if (name !== undefined) {
    const trimmedName = name?.trim();
    if (trimmedName) {
      await db.user.update({
        where: { id: session.user.id },
        data: { name: trimmedName },
      });
    }
  }

  const updated = await db.profile.update({
    where: { id: profile.id },
    data: {
      ...(visibility && { visibility }),
      ...(headline !== undefined && { headline: headline?.trim() || null }),
      ...(bio !== undefined && { bio: bio?.trim() || null }),
      ...(location !== undefined && { location: location?.trim() || null }),
      ...(website !== undefined && { website: website?.trim() || null }),
      ...(linkedin !== undefined && { linkedin: linkedin?.trim() || null }),
      ...(github !== undefined && { github: github?.trim() || null }),
    },
  });

  // Regenerate embedding since headline/bio/location affect search
  generateProfileEmbedding(profile.id).catch(console.error);

  return NextResponse.json({ profile: updated });
}
