export async function GET() {
  const keys = [
    "OPENROUTER_API_KEY",
    "OPENROUTER_MODEL",
    "OPENROUTER_SITE_URL",
    "OPENROUTER_APP_TITLE",
  ];
  const presence = Object.fromEntries(
    keys.map((k) => [k, Boolean(process.env[k])])
  );
  return Response.json({ ok: true, presence });
}
