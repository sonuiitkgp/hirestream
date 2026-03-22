import { extractText } from "unpdf";
import Groq from "groq-sdk";
import type { ParsedResume } from "@/types";

const SYSTEM_PROMPT = `You are an expert resume parser. Your job is to extract EVERY piece of content from the resume — do NOT skip, summarize, or shorten anything.

CRITICAL RULES:
- Extract ALL bullet points, descriptions, and details VERBATIM — do not paraphrase or condense
- ALL "description" fields MUST use **Markdown** formatting to preserve the original structure:
  - Bullet points: use "- " (dash space) for each bullet, separated by "\\n"
  - Bold text: wrap with **double asterisks**
  - Italic text: wrap with *single asterisks*
  - Sub-bullets: use "  - " (two spaces + dash + space)
  - Line breaks between paragraphs: use "\\n\\n"
  - If the original has numbered lists, use "1. ", "2. ", etc.
  - Preserve emphasis: if the resume has bold job titles, bold keywords, or italic phrases, keep them
- If a field has no data, use null or empty string — do NOT omit the entire entry
- Include ALL entries for each section — if someone has 8 experiences, return all 8
- Capture ALL skills, certifications, awards, languages, publications, achievements, courses, volunteering, etc. in the misc array
- For dates: if only month/year is given (e.g. "Jan 2023"), use "2023-01-01". If only year, use "YYYY-01-01". If "Present"/"Current", set endDate to null and current to true

EXAMPLE description field with markdown:
"- **Led** a team of 5 engineers to deliver microservices platform\\n- Reduced API latency by *40%* through caching and query optimization\\n- Implemented CI/CD pipeline using Jenkins and Docker\\n- Mentored 3 junior developers on best practices"

Return ONLY valid JSON matching this schema:
{
  "headline": "string (job title or professional headline)",
  "bio": "string (full professional summary/objective in markdown — include the COMPLETE text, preserve any bold/italic/bullets)",
  "location": "string",
  "linkedin": "string (URL)",
  "github": "string (URL)",
  "website": "string (URL or portfolio link)",
  "phone": "string",
  "email": "string",
  "experiences": [{ "company": "string", "role": "string", "startDate": "ISO date", "endDate": "ISO date or null", "current": boolean, "description": "string (markdown — ALL bullet points with - prefix, bold, italic preserved)", "location": "string" }],
  "projects": [{ "name": "string", "description": "string (markdown — ALL details with bullets, bold, italic)", "techStack": ["string"], "url": "string or null", "repoUrl": "string or null" }],
  "internships": [{ "company": "string", "role": "string", "startDate": "ISO date", "endDate": "ISO date or null", "current": boolean, "description": "string (markdown — ALL bullets, bold, italic)", "location": "string or null", "stipend": "string or null" }],
  "academicBgs": [{ "institution": "string", "degree": "string", "field": "string (use 'General' if not specified)", "startYear": number, "endYear": number or null, "gpa": number or null, "current": boolean }],
  "extraCurriculars": [{ "activity": "string", "role": "string or null", "description": "string or null (markdown — ALL details with formatting)" }],
  "codechef": { "username": "string", "rating": number or null },
  "misc": [{ "title": "string (e.g. Skills, Certifications, Languages, Awards, Publications, Courses, Volunteering, Interests, References)", "items": ["string"] }]
}

IMPORTANT: Every section of the resume MUST appear somewhere in the output. If content doesn't fit experiences/projects/internships/academics/extracurriculars/codechef, it MUST go into misc. Do NOT discard any content.`;

function getGroq() {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("Missing GROQ_API_KEY environment variable");
  return new Groq({ apiKey: key });
}

async function extractPdfText(pdfBuffer: Buffer): Promise<string> {
  const uint8 = new Uint8Array(pdfBuffer);
  const { text } = await extractText(uint8, { mergePages: true });
  return Array.isArray(text) ? text.join("\n") : (text as string);
}

export async function parseResumePdf(pdfBuffer: Buffer): Promise<ParsedResume> {
  const resumeText = await extractPdfText(pdfBuffer);

  const groq = getGroq();
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0,
    max_tokens: 8000,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Resume text:\n\n${resumeText}` },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  return JSON.parse(raw) as ParsedResume;
}
