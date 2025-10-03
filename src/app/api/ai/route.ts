// src/app/api/ai/route.ts

const BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

type PostBody = {
  prompt?: unknown;
  model?: unknown; // optional override from request
  maxTokens?: unknown;
  temperature?: unknown;
};

export async function POST(req: Request) {
  try {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) {
      return new Response(JSON.stringify({ error: "Missing OPENROUTER_API_KEY" }), { status: 500 });
    }

    const {
      prompt,
      model,
      maxTokens,
      temperature,
    } = (await req.json().catch(() => ({}))) as PostBody;

    const textPrompt = typeof prompt === "string" ? prompt.trim() : "";
    if (!textPrompt) return Response.json({ error: "Prompt is required" }, { status: 400 });
    if (textPrompt.length > 8000) return Response.json({ error: "Prompt too long" }, { status: 413 });

    const chosenModel =
      (typeof model === "string" && model.trim()) ||
      process.env.OPENROUTER_MODEL ||
      "anthropic/claude-3.5-sonnet";

    // Build request for OpenRouter (OpenAI-compatible format)
    const body = {
      model: chosenModel,
      messages: [
        { role: "system", content: "You are a concise, helpful assistant." },
        { role: "user", content: textPrompt },
      ],
      max_tokens: typeof maxTokens === "number" ? maxTokens : 400,
      temperature: typeof temperature === "number" ? temperature : 0.7,
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    };

    // Optional but recommended by OpenRouter
    if (process.env.OPENROUTER_SITE_URL) headers["HTTP-Referer"] = process.env.OPENROUTER_SITE_URL;
    if (process.env.OPENROUTER_APP_TITLE) headers["X-Title"] = process.env.OPENROUTER_APP_TITLE;

    const res = await fetch(BASE_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      return new Response(JSON.stringify({ error: `Upstream ${res.status}`, detail: errText }), {
        status: 502,
      });
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      model?: string;
      id?: string;
    };

    const text = json?.choices?.[0]?.message?.content ?? "";

    return Response.json({ ok: true, model: json?.model ?? chosenModel, text, id: json?.id });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("OpenRouter error:", msg);
    return new Response(JSON.stringify({ error: "AI request failed", detail: msg }), { status: 500 });
  }
}

export async function GET() {
  return Response.json({ ok: true, message: "AI route is alive" });
}
