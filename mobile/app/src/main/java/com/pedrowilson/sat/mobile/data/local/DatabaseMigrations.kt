package com.pedrowilson.sat.mobile.data.local

import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase

object DatabaseMigrations {

    val MIGRATION_1_2: Migration =
        object : Migration(1, 2) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL(
                    "ALTER TABLE stock_items ADD COLUMN updated_at TEXT NOT NULL DEFAULT ''"
                )
            }
        }

    val MIGRATION_2_3: Migration =
        object : Migration(2, 3) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL(
                    "ALTER TABLE consumption_events ADD COLUMN sync_error TEXT"
                )
            }
        }

    val MIGRATION_3_4: Migration =
        object : Migration(3, 4) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL("DROP TABLE IF EXISTS consumption_events")
                db.execSQL("DROP TABLE IF EXISTS stock_items")

                db.execSQL(
                    """
                    CREATE TABLE IF NOT EXISTS stock_items (
                        id INTEGER NOT NULL,
                        sku TEXT NOT NULL,
                        name TEXT NOT NULL,
                        quantity_available INTEGER NOT NULL,
                        minimum_threshold INTEGER NOT NULL,
                        updated_at TEXT NOT NULL,
                        PRIMARY KEY(id)
                    )
                    """.trimIndent()
                )

                db.execSQL(
                    """
                    CREATE TABLE IF NOT EXISTS consumption_events (
                        local_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                        external_event_id TEXT NOT NULL,
                        item_id INTEGER NOT NULL,
                        quantity INTEGER NOT NULL,
                        occurred_at TEXT NOT NULL,
                        sync_status TEXT NOT NULL,
                        reason TEXT,
                        created_at TEXT NOT NULL,
                        synced_at TEXT,
                        sync_error TEXT
                    )
                    """.trimIndent()
                )
                db.execSQL(
                    """
                    CREATE UNIQUE INDEX IF NOT EXISTS index_consumption_events_external_event_id
                    ON consumption_events (external_event_id)
                    """.trimIndent()
                )
            }
        }

    val MIGRATION_4_5: Migration =
        object : Migration(4, 5) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL("DROP TABLE IF EXISTS consumption_events")
                db.execSQL("DROP TABLE IF EXISTS stock_items")

                db.execSQL(
                    """
                    CREATE TABLE IF NOT EXISTS stock_items (
                        id INTEGER NOT NULL,
                        sku TEXT NOT NULL,
                        name TEXT NOT NULL,
                        quantity_available INTEGER NOT NULL,
                        minimum_threshold INTEGER NOT NULL,
                        updated_at TEXT NOT NULL,
                        PRIMARY KEY(id)
                    )
                    """.trimIndent()
                )

                db.execSQL(
                    """
                    CREATE TABLE IF NOT EXISTS consumption_events (
                        local_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                        external_event_id TEXT NOT NULL,
                        item_id INTEGER NOT NULL,
                        quantity INTEGER NOT NULL,
                        occurred_at TEXT NOT NULL,
                        sync_status TEXT NOT NULL,
                        reason TEXT,
                        created_at TEXT NOT NULL,
                        synced_at TEXT,
                        sync_error TEXT
                    )
                    """.trimIndent()
                )
                db.execSQL(
                    """
                    CREATE UNIQUE INDEX IF NOT EXISTS index_consumption_events_external_event_id
                    ON consumption_events (external_event_id)
                    """.trimIndent()
                )
            }
        }
}
