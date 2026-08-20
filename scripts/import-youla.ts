import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";
const importSecret = process.env.IMPORT_SECRET;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  if (!importSecret) {
    console.error("IMPORT_SECRET не задан в .env / .env.local");
    process.exit(1);
  }

  const headers = { "x-import-secret": importSecret };

  console.log("Запуск импорта через API...");

  const startResponse = await fetch(`${baseUrl}/api/import-youla`, {
    method: "POST",
    headers,
  });

  const startPayload = (await startResponse.json()) as {
    success?: boolean;
    message?: string;
    error?: string;
  };

  if (!startResponse.ok || !startPayload.success) {
    console.error(startPayload.error ?? startPayload.message ?? "Не удалось запустить импорт");
    process.exit(1);
  }

  console.log(startPayload.message ?? "Импорт запущен");

  for (let attempt = 0; attempt < 600; attempt += 1) {
    await sleep(2000);

    const statusResponse = await fetch(`${baseUrl}/api/import-youla`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const status = (await statusResponse.json()) as {
      success?: boolean;
      error?: string;
      syncStatus?: string;
      syncMessage?: string | null;
    };

    if (!statusResponse.ok || !status.success) {
      console.error(status.error ?? "Не удалось получить статус");
      process.exit(1);
    }

    if (status.syncStatus === "running") {
      if (status.syncMessage) console.log(status.syncMessage);
      continue;
    }

    if (status.syncStatus === "error") {
      console.error(status.syncMessage ?? "Импорт завершился с ошибкой");
      process.exit(1);
    }

    console.log(status.syncMessage ?? "Импорт завершён");
    return;
  }

  console.error("Таймаут ожидания импорта");
  process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
