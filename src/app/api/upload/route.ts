import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseResumePdf } from "@/lib/ai/resume-parser";
import { safeDate } from "@/lib/utils";
import { generateProfileEmbedding } from "@/lib/ai/profile-embedding";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("resume") as File | null;
  const replace = formData.get("replace") === "true";

  if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF files accepted" }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let parsed;
  try {
    parsed = await parseResumePdf(buffer);
  } catch {
    return NextResponse.json({ error: "Failed to parse resume — please try again" }, { status: 422 });
  }

  // Save upload record
  await db.resumeUpload.create({
    data: {
      userId: session.user.id,
      fileUrl: "",
      fileName: file.name,
      parsedData: parsed as object,
      processedAt: new Date(),
    },
  });

  const profile = await db.profile.findUnique({ where: { userId: session.user.id } });
  if (profile) {
    // If replace mode: delete all existing sections first
    if (replace) {
      await Promise.all([
        db.experience.deleteMany({ where: { profileId: profile.id } }),
        db.project.deleteMany({ where: { profileId: profile.id } }),
        db.internship.deleteMany({ where: { profileId: profile.id } }),
        db.academicBackground.deleteMany({ where: { profileId: profile.id } }),
        db.extraCurricular.deleteMany({ where: { profileId: profile.id } }),
        db.codeChefProfile.deleteMany({ where: { profileId: profile.id } }),
      ]);
    }

    // Update profile base fields (always overwrite if replace, else only if empty)
    await db.profile.update({
      where: { id: profile.id },
      data: {
        headline: replace ? (parsed.headline || profile.headline) : (profile.headline || parsed.headline || undefined),
        bio: replace ? (parsed.bio || profile.bio) : (profile.bio || parsed.bio || undefined),
        location: replace ? (parsed.location || profile.location) : (profile.location || parsed.location || undefined),
        linkedin: replace ? (parsed.linkedin || profile.linkedin) : (profile.linkedin || parsed.linkedin || undefined),
        github: replace ? (parsed.github || profile.github) : (profile.github || parsed.github || undefined),
        website: replace ? (parsed.website || profile.website) : (profile.website || parsed.website || undefined),
        miscData: parsed.misc && parsed.misc.length > 0 ? (parsed.misc as object[]) : undefined,
      },
    });

    // Insert parsed sections (skip if section already has data in non-replace mode)
    const expCount = replace ? 0 : await db.experience.count({ where: { profileId: profile.id } });
    if (expCount === 0 && parsed.experiences?.length) {
      const expRows: { profileId: string; company: string; role: string; startDate: Date; endDate: Date | null; current: boolean; description: string | null; location: string | null }[] = [];
      for (const e of parsed.experiences) {
        const startDate = safeDate(e.startDate);
        if (!startDate) continue;
        expRows.push({
          profileId: profile.id,
          company: e.company || "Unknown",
          role: e.role || "Unknown",
          startDate,
          endDate: safeDate(e.endDate),
          current: e.current ?? false,
          description: e.description || null,
          location: e.location || null,
        });
      }
      if (expRows.length) await db.experience.createMany({ data: expRows });
    }

    const projCount = replace ? 0 : await db.project.count({ where: { profileId: profile.id } });
    if (projCount === 0 && parsed.projects?.length) {
      await db.project.createMany({
        data: parsed.projects.map((p) => ({
          profileId: profile.id,
          name: p.name || "Untitled Project",
          description: p.description || null,
          techStack: p.techStack ?? [],
          url: p.url || null,
          repoUrl: p.repoUrl || null,
        })),
      });
    }

    const acadCount = replace ? 0 : await db.academicBackground.count({ where: { profileId: profile.id } });
    if (acadCount === 0 && parsed.academicBgs?.length) {
      await db.academicBackground.createMany({
        data: parsed.academicBgs.map((a) => ({
          profileId: profile.id,
          institution: a.institution || "Unknown",
          degree: a.degree || "Unknown",
          field: a.field || "General",
          startYear: a.startYear ?? 0,
          endYear: a.endYear ?? null,
          gpa: a.gpa ?? null,
          current: a.current ?? false,
        })),
      });
    }

    const internCount = replace ? 0 : await db.internship.count({ where: { profileId: profile.id } });
    if (internCount === 0 && parsed.internships?.length) {
      const internRows: { profileId: string; company: string; role: string; startDate: Date; endDate: Date | null; current: boolean; description: string | null; location: string | null; stipend: string | null }[] = [];
      for (const i of parsed.internships) {
        const startDate = safeDate(i.startDate);
        if (!startDate) continue;
        internRows.push({
          profileId: profile.id,
          company: i.company || "Unknown",
          role: i.role || "Unknown",
          startDate,
          endDate: safeDate(i.endDate),
          current: i.current ?? false,
          description: i.description || null,
          location: i.location || null,
          stipend: i.stipend || null,
        });
      }
      if (internRows.length) await db.internship.createMany({ data: internRows });
    }

    const ecCount = replace ? 0 : await db.extraCurricular.count({ where: { profileId: profile.id } });
    if (ecCount === 0 && parsed.extraCurriculars?.length) {
      await db.extraCurricular.createMany({
        data: parsed.extraCurriculars.map((ec) => ({
          profileId: profile.id,
          activity: ec.activity || "Activity",
          role: ec.role || null,
          description: ec.description || null,
        })),
      });
    }

    if (parsed.codechef?.username) {
      const existing = await db.codeChefProfile.findUnique({ where: { profileId: profile.id } });
      if (!existing) {
        await db.codeChefProfile.create({
          data: {
            profileId: profile.id,
            username: parsed.codechef.username,
            rating: parsed.codechef.rating ?? null,
          },
        });
      }
    }

    generateProfileEmbedding(profile.id).catch(console.error);
  }

  return NextResponse.json({ success: true, parsed });
}
