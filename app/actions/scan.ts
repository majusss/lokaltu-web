"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

/**
 * Verifies that the scanned NFC tag belongs to the current user.
 * Returns true if matched, false if not linked to this user.
 */
export async function verifyBag(
  tagId: string,
): Promise<{ ok: boolean; error?: string }> {
  const user = await currentUser();
  if (!user) return { ok: false, error: "Nie zalogowany." };

  const userDb = await prisma.user.findUnique({ where: { id: user.id } });
  if (!userDb) return { ok: false, error: "Nie znaleziono konta." };
  if (!userDb.bagId) return { ok: false, error: "Brak przypisanej torby." };

  if (userDb.bagId.toLowerCase().trim() !== tagId.toLowerCase().trim()) {
    return { ok: false, error: "To nie jest Twoja torba." };
  }

  return { ok: true };
}

/**
 * Sends a base64 image to OpenRouter AI and returns how confident the AI is
 * that the photo shows fresh (just-done) grocery shopping.
 */
export async function analyzeReceipt(imageBase64: string): Promise<{
  confidence: number; // 0-100
  reasoning: string;
}> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey)
    throw new Error("Brak klucza API OpenRouter (OPENROUTER_API_KEY).");

  const body = {
    model: "qwen/qwen3-vl-235b-a22b-thinking",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `You are a receipt and shopping verification assistant.
Look at the attached photo and determine how confident you are (0–100%) that:
1. The photo shows groceries or shopping items that were just purchased (fresh, recent purchase).
2. The items appear real and not staged.

Respond ONLY with a valid JSON object in this exact format:
{"confidence": <number 0-100>, "reasoning": "<one sentence in Polish explaining your verdict>"}`,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
            },
          },
        ],
      },
    ],
  };

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://lokaltu.pl",
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${text}`);
  }

  const json = (await response.json()) as {
    choices: { message: { content: string } }[];
  };
  const raw = json.choices[0]?.message?.content ?? "";

  // Extract JSON from the response (model may add markdown fences)
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Nieprawidłowa odpowiedź AI.");

  const parsed = JSON.parse(match[0]) as {
    confidence: number;
    reasoning: string;
  };
  return { confidence: parsed.confidence, reasoning: parsed.reasoning };
}
