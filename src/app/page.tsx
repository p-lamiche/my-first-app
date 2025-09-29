"use client";

import { useState } from "react";

export default function Home() {
  const [status, setStatus] = useState<string>("");

  async function checkHealth() {
    try {
      const res = await fetch("/api/health");
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setStatus(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setStatus("❌ Error: " + err.message);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
      <h1 className="text-3xl font-bold">Health Check Demo</h1>
      <button
        onClick={checkHealth}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Check API Health
      </button>
      {status && (
        <pre className="bg-gray-100 p-4 rounded text-sm w-full max-w-lg overflow-x-auto">
          {status}
        </pre>
      )}
    </main>
  );
}
