import { z } from "zod";
import type { ScrapedProduct } from "./scraper";
import type { ScriptDraft } from "./script-writer";

const aiScriptSchema = z.array(
  z.object({
    angle: z.enum(["review nhanh", "deal sốc", "vấn đề - giải pháp"]),
    content: z.string().min(20).max(600),
    score: z.number().int().min(0).max(100)
  })
);

type AiProvider = {
  name: "gemini" | "deepseek" | "openai";
  key: string;
};

export function getAiProviderChain(): AiProvider[] {
  const providers = [
    { name: "gemini", key: process.env.GEMINI_API_KEY ?? "" },
    { name: "deepseek", key: process.env.DEEPSEEK_API_KEY ?? "" },
    { name: "openai", key: process.env.OPENAI_API_KEY ?? "" }
  ] satisfies AiProvider[];

  return providers.filter((provider) => provider.key.length > 0);
}

export function buildAffiliateScriptPrompt(product: ScrapedProduct) {
  return [
    "Viet 3 kich ban short video affiliate tieng Viet.",
    "Tra ve JSON array, khong markdown.",
    "Moi item co angle, content, score.",
    "Angles bat buoc: review nhanh, deal sốc, vấn đề - giải pháp.",
    `Ten san pham: ${product.title}`,
    `Gia: ${product.price}`,
    `Mo ta: ${product.description}`,
    `Rating: ${product.rating ?? "khong ro"}`
  ].join("\n");
}

export async function writeScriptsWithAi(product: ScrapedProduct): Promise<ScriptDraft[] | null> {
  const prompt = buildAffiliateScriptPrompt(product);

  for (const provider of getAiProviderChain()) {
    const text = await callProvider(provider, prompt).catch(() => null);
    if (!text) continue;

    const parsedJson = parseJson(text);
    const parsedScripts = aiScriptSchema.safeParse(parsedJson);
    if (parsedScripts.success) return parsedScripts.data;
  }

  return null;
}

async function callProvider(provider: AiProvider, prompt: string) {
  if (provider.name === "gemini") return callGemini(provider.key, prompt);
  if (provider.name === "deepseek") return callOpenAiCompatible("https://api.deepseek.com/chat/completions", provider.key, prompt);
  return callOpenAiCompatible("https://api.openai.com/v1/chat/completions", provider.key, prompt);
}

async function callGemini(key: string, prompt: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    }
  );
  if (!response.ok) throw new Error("Gemini request failed.");
  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

async function callOpenAiCompatible(endpoint: string, key: string, prompt: string) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: endpoint.includes("deepseek") ? "deepseek-chat" : "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    })
  });
  if (!response.ok) throw new Error("AI request failed.");
  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content ?? "";
}

function parseJson(text: string) {
  const clean = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  return JSON.parse(clean);
}
