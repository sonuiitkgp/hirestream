import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "RECRUITER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Recruiters only" }, { status: 403 });
  }
  const jobs = await db.job.findMany({
    where: { recruiterId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ jobs });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "RECRUITER") return NextResponse.json({ error: "Recruiters only" }, { status: 403 });

  const { title, description, requirements, location, remote, salaryMin, salaryMax } = await req.json();
  if (!title?.trim() || !description?.trim()) {
    return NextResponse.json({ error: "title and description are required" }, { status: 400 });
  }

  const job = await db.job.create({
    data: {
      recruiterId: session.user.id,
      title: title.trim(),
      description: description.trim(),
      requirements: Array.isArray(requirements) ? requirements : [],
      location: location?.trim() || null,
      remote: remote ?? false,
      salaryMin: salaryMin ? Number(salaryMin) : null,
      salaryMax: salaryMax ? Number(salaryMax) : null,
    },
  });

  // Generate job embedding in background (non-blocking)
  generateJobEmbedding(job.id).catch(console.error);

  return NextResponse.json({ job }, { status: 201 });
}

// Helper defined inline
async function generateJobEmbedding(jobId: string) {
  try {
    const { embedText } = await import("@/lib/ai/embeddings");
    const job = await db.job.findUnique({ where: { id: jobId } });
    if (!job) return;
    const text = [job.title, job.description, job.requirements.join(", "), job.location]
      .filter(Boolean).join("\n");
    const vector = await embedText(text);
    const vectorStr = `[${vector.join(",")}]`;
    await (db as any).$executeRawUnsafe(
      `UPDATE "Job" SET embedding = $1::vector WHERE id = $2`,
      vectorStr, jobId
    );
  } catch {
    // Non-fatal — embedding generation is best-effort
  }
}
