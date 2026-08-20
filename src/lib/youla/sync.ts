import type { Payload } from "payload";
import { parseYoulaStore } from "./client";
import { importYoulaData } from "./importer";
import type { YoulaImportStats } from "./types";

export interface RunYoulaImportOptions {
  storeUrl: string;
  onProgress?: (message: string) => void;
}

export interface RunYoulaImportResult {
  storeTitle: string;
  productCount: number;
  categoryCount: number;
  stats: YoulaImportStats;
}

export async function runYoulaImport(
  payload: Payload,
  options: RunYoulaImportOptions,
): Promise<RunYoulaImportResult> {
  const parsed = await parseYoulaStore(options.storeUrl, options.onProgress);
  const stats = await importYoulaData(payload, parsed);

  return {
    storeTitle: parsed.store.title,
    productCount: parsed.products.length,
    categoryCount: parsed.categories.length,
    stats,
  };
}
