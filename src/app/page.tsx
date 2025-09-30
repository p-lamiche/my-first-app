"use client";

import { useState } from "react";

export default function Home() {
  const [status, setStatus] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [ai, setAi] = useState<string>("");

  async function checkHealth() {
    try {
      const res = await fetch("/api/health");
      if (!res.ok) throw new Error(`Request failed with ${res.status}`);
      const data: unknown = await res.json();
      setStatus(JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatus("❌ Error: " + msg);
    }
  }

  async function runClaude() {
    try {
      setAi("Thinking...");
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) {
        // Try to read error detail if provided by API
        const maybeJson = await res
          .json()
          .catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(maybeJson.error ?? `HTTP ${res.status}`);
      }
      const data: unknown = await res.json();
      // Narrow the response structure
      const text =
        typeof (data as { text?: unknown })?.text === "string"
          ? (data as { text: string }).text
          : JSON.stringify(data, null, 2);
      setAi(text);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAi("❌ " + msg);
    }
  }

  return (
    <main className="flex flex-col items-center min-h-screen gap-6 p-8">
      <h1 className="text-3xl font-bold">My First App</h1>

      <section className="w-full max-w-2xl flex flex-col gap-3">
        <button
          onClick={checkHealth}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Check API Health
        </button>
        {status && (
          <pre className="bg-gray-100 p-4 rounded text-sm whitespace-pre-wrap">
            {status}
          </pre>
        )}
      </section>

      <section className="w-full max-w-2xl flex flex-col gap-3">
        <textarea
          className="w-full border rounded p-3"
          rows={4}
          placeholder="Ask Claude something…"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          onClick={runClaude}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Ask Claude
        </button>
        {ai && (
          <pre className="bg-gray-100 p-4 rounded text-sm whitespace-pre-wrap">
            {ai}
          </pre>
        )}
      </section>
    </main>
  );
}
