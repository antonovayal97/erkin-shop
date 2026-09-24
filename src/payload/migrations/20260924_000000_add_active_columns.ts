import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-sqlite';

const TABLES = ['categories', 'products'];

async function hasColumn(
  db: MigrateUpArgs['db'],
  table: string,
  column: string,
): Promise<boolean> {
  const rows = (await db.all(sql.raw(`PRAGMA table_info(${table})`))) as { name: string }[];
  return rows.some((row) => row.name === column);
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Удаляем dev-маркер (batch = -1): он заставляет Payload спрашивать
  // "Run Payload in dev mode?" интерактивно и блокировать неитерактивные
  // команды (next build, payload migrate) без stdin.
  try {
    await db.run(sql.raw(`DELETE FROM payload_migrations WHERE batch = -1`));
  } catch {
    // таблицы payload_migrations может не быть на свежей БД — игнорируем
  }
  // Adds the `active` checkbox column (introduced for admin deactivation).
  // Guarded with PRAGMA so it is safe on databases that already received the
  // column via dev-mode push, as well as production databases that are missing it.
  for (const table of TABLES) {
    if (!(await hasColumn(db, table, 'active'))) {
      await db.run(
        sql.raw(`ALTER TABLE ${table} ADD COLUMN active integer DEFAULT true NOT NULL`),
      );
    }
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const table of TABLES) {
    if (await hasColumn(db, table, 'active')) {
      await db.run(sql.raw(`ALTER TABLE ${table} DROP COLUMN active`));
    }
  }
}
