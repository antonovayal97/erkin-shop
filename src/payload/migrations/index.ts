import * as migration_20260924_000000_add_active_columns from './20260924_000000_add_active_columns';

export const migrations = [
  {
    up: migration_20260924_000000_add_active_columns.up,
    down: migration_20260924_000000_add_active_columns.down,
    name: '20260924_000000_add_active_columns'
  },
];
