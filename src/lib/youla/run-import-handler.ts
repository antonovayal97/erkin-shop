import type { Payload } from "payload";
import { runYoulaImport } from "./sync";

const DEFAULT_STORE_URL = "https://youla.ru/store/6658996c2ca0aa09e3cafccf";

function buildSummary(result: Awaited<ReturnType<typeof runYoulaImport>>) {
  const { stats } = result;
  const summary = [
    `Магазин: ${result.storeTitle}`,
    `Товаров на Youla: ${result.productCount}`,
    `Создано товаров: ${stats.productsCreated}`,
    `Обновлено товаров: ${stats.productsUpdated}`,
    `Создано категорий: ${stats.categoriesCreated}`,
    `Обновлено категорий: ${stats.categoriesUpdated}`,
    `Архивировано: ${stats.productsArchived}`,
    `Загружено изображений: ${stats.imagesUploaded}`,
  ];

  if (stats.errors.length) {
    summary.push("", `Ошибки (${stats.errors.length}):`, ...stats.errors.slice(0, 5));
    if (stats.errors.length > 5) {
      summary.push(`... и ещё ${stats.errors.length - 5}`);
    }
  }

  return summary.join("\n");
}

export async function executeYoulaImport(payload: Payload) {
  const global = await payload.findGlobal({ slug: "youla-import" });
  const storeUrl = global.storeUrl?.trim() || DEFAULT_STORE_URL;

  await payload.updateGlobal({
    slug: "youla-import",
    data: {
      storeUrl,
      syncStatus: "running",
      syncMessage: "Импорт запущен...",
    },
  });

  const result = await runYoulaImport(payload, {
    storeUrl,
    onProgress: async (message) => {
      await payload.updateGlobal({
        slug: "youla-import",
        data: { syncMessage: message },
      });
    },
  });

  const message = buildSummary(result);
  const syncStatus = result.stats.errors.length ? "completed_with_errors" : "success";

  await payload.updateGlobal({
    slug: "youla-import",
    data: {
      syncStatus,
      syncMessage: message,
      lastSyncAt: new Date().toISOString(),
      lastStats: result.stats,
    },
  });

  return { message, stats: result.stats, syncStatus };
}
