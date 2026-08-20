import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";
const importSecret = process.env.IMPORT_SECRET;

async function main() {
  if (!importSecret) {
    console.error("IMPORT_SECRET не задан в .env.local");
    process.exit(1);
  }

  console.log("Запуск импорта через API (может занять 5–10 минут)...");

  const response = await fetch(`${baseUrl}/api/import-youla`, {
    method: "POST",
    headers: {
      "x-import-secret": importSecret,
    },
    signal: AbortSignal.timeout(600_000),
  });

  const payload = (await response.json()) as {
    success?: boolean;
    message?: string;
    error?: string;
  };

  if (!response.ok || !payload.success) {
    console.error(payload.error ?? payload.message ?? "Импорт не удался");
    process.exit(1);
  }

  console.log(payload.message ?? "Импорт завершён");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
