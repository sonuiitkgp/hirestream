import { flashModel } from "./gemini";
import type { ParsedResume } from "@/types";

const SYSTEM_PROMPT = `You are an expert resume parser. Extract structured data from the resume text provided.
Return ONLY valid JSON matching this schema (omit fields with no data):
{
  "headline": "string",
  "bio": "string (professional summary)",
  "location": "string",
  "linkedin": "string (URL)",
  "github": "string (URL)",
  "website": "string (URL)",
  "experiences": [{ "company": "string", "role": "string", "startDate": "ISO date", "endDate": "ISO date or null", "current": boolean, "description": "string", "location": "string" }],
  "projects": [{ "name": "string", "description": "string", "techStack": ["string"], "url": "string or null", "repoUrl": "string or null" }],
  "internships": [{ "company": "string", "role": "string", "startDate": "ISO date", "endDate": "ISO date or null", "current": boolean, "description": "string", "stipend": "string or null" }],
  "academicBgs": [{ "institution": "string", "degree": "string", "field": "string", "startYear": number, "endYear": number or null, "gpa": number or null, "current": boolean }],
  "extraCurriculars": [{ "activity": "string", "role": "string or null", "description": "string or null" }],
  "codechef": { "username": "string", "rating": number or null }
}`;

export async function parseResumeText(text: string): Promise<ParsedResume> {
  const result = await flashModel.generateContent([
    SYSTEM_PROMPT,
    `Resume text:\n\n${text}`,
  ]);
  const raw = result.response.text();
  return JSON.parse(raw) as ParsedResume;
}
