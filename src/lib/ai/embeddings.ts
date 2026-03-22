import { getEmbeddingModel } from "./gemini";
import type { FullProfile } from "@/types";

/**
 * Build a text representation of a profile for embedding.
 */
export function profileToText(profile: FullProfile): string {
  const parts: string[] = [];

  if (profile.headline) parts.push(profile.headline);
  if (profile.bio) parts.push(profile.bio);

  for (const exp of profile.experiences) {
    parts.push(`${exp.role} at ${exp.company}. ${exp.description ?? ""}`);
  }
  for (const proj of profile.projects) {
    parts.push(`Project: ${proj.name}. Tech: ${proj.techStack.join(", ")}. ${proj.description ?? ""}`);
  }
  for (const intern of profile.internships) {
    parts.push(`Internship: ${intern.role} at ${intern.company}. ${intern.description ?? ""}`);
  }
  for (const acad of profile.academicBgs) {
    parts.push(`${acad.degree} in ${acad.field} at ${acad.institution}.`);
  }

  return parts.join("\n");
}

/**
 * Generate a 768-dim embedding vector for arbitrary text.
 */
export async function embedText(text: string): Promise<number[]> {
  // outputDimensionality is supported at runtime but not in the SDK types yet
  const result = await getEmbeddingModel().embedContent({
    content: { role: "user", parts: [{ text }] },
    outputDimensionality: 768,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
  return result.embedding.values;
}

/**
 * Generate and return embedding for a full profile.
 */
export async function embedProfile(profile: FullProfile): Promise<number[]> {
  const text = profileToText(profile);
  return embedText(text);
}
