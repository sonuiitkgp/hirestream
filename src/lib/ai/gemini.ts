import { GoogleGenerativeAI } from "@google/generative-ai";

function getGenAI() {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key) throw new Error("Missing GOOGLE_AI_API_KEY environment variable");
  return new GoogleGenerativeAI(key);
}

export function getEmbeddingModel() {
  return getGenAI().getGenerativeModel({ model: "gemini-embedding-001" });
}
