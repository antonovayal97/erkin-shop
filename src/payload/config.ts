import { buildConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

import { Media } from "./collections/Media";
import { Categories } from "./collections/Categories";
import { Products } from "./collections/Products";
import { Users } from "./collections/Users";
import { Orders } from "./collections/Orders";
import { YoulaImport } from "./globals/YoulaImport";
import { ShopSettings } from "./globals/ShopSettings";
import { migrations } from "./migrations/index";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";

// Во время `next build` Payload инициализируется при сборе данных страниц.
// Включение `prodMigrations` в этот момент вызывает `migrate()`, затем
// интерактивный CLI-запрос ("Run Payload in dev mode...") без stdin — build
// зависает навсегда. Поэтому при сборке миграции отключаем, а в production
// (NEXT_PHASE = phase-production-server) они применяются при старте сервера.
const isBuilding = process.env.NEXT_PHASE === "phase-production-build";

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: "— ERKIN SHOP",
    },
  },
  collections: [Users, Products, Categories, Orders, Media],
  globals: [ShopSettings, YoulaImport],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET ?? "super-secret-payload-key-change-in-production",
  typescript: {
    outputFile: path.resolve(dirname, "../types/payload-types.ts"),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL ?? `file:${path.resolve(dirname, "../../shop.db")}`,
    },
    // Папка миграций для команд `payload migrate*` (см. MIGRATIONS.md)
    migrationDir: path.resolve(dirname, "./migrations"),
    // В production Payload не автосинхронизирует схему: невыполненные
    // миграции применяются автоматически при старте сервера (подходит
    // для long-running сервера на VPS). В dev по-прежнему работает push.
    prodMigrations: isBuilding ? undefined : migrations,
  }),
  sharp,
  serverURL,
  // Cookie auth rejects requests whose Origin is not in this list.
  // Must match the public HTTPS URL on VPS (same as NEXT_PUBLIC_SERVER_URL).
  csrf: [serverURL],
  cors: [serverURL],
  upload: {
    limits: {
      fileSize: 10_000_000,
    },
  },
});
