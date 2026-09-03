import { NextRequest, NextResponse } from "next/server";

// POST /api/ai-generate
// Body: { description: string }
// Возвращает: { steps: string[], expected: string }
//
// По умолчанию использует OpenAI-совместимый Chat Completions API.
// Чтобы использовать DeepSeek вместо OpenAI — поменяйте BASE_URL и модель,
// формат запроса у них совместим с OpenAI.
const BASE_URL = process.env.AI_BASE_URL || "https://api.openai.com/v1";
const MODEL = process.env.AI_MODEL || "gpt-4o-mini";
const API_KEY = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = `Ты — опытный QA-инженер. По описанию фичи от пользователя составь пошаговый тест-кейс.
Отвечай СТРОГО в формате JSON без каких-либо пояснений и без markdown-разметки:
{"steps": ["шаг 1", "шаг 2", "..."], "expected": "итоговый ожидаемый результат"}
Шаги должны быть конкретными и проверяемыми. Пиши на русском языке.`;

export async function POST(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "AI_API_KEY (или OPENAI_API_KEY) не задан на сервере" },
      { status: 500 }
    );
  }

  const { description } = await req.json();
  if (!description || !description.trim()) {
    return NextResponse.json({ error: "description is required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.4,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: description },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: "AI provider error", details: errText }, { status: 502 });
    }

    const data = await res.json();
    const raw: string = data.choices?.[0]?.message?.content ?? "{}";
    const cleaned = raw.replace(/```json|```/g, "").trim();

    let parsed: { steps?: string[]; expected?: string };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Не удалось разобрать ответ модели", raw }, { status: 502 });
    }

    return NextResponse.json({
      steps: Array.isArray(parsed.steps) ? parsed.steps : [],
      expected: parsed.expected ?? "",
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Unknown error" }, { status: 500 });
  }
}
