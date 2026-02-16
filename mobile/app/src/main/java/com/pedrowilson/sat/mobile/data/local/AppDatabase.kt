package com.pedrowilson.sat.mobile.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.pedrowilson.sat.mobile.data.local.dao.ConsumptionEventDao
import com.pedrowilson.sat.mobile.data.local.dao.StockItemDao
import com.pedrowilson.sat.mobile.data.local.entity.ConsumptionEventEntity
import com.pedrowilson.sat.mobile.data.local.entity.StockItemEntity

@Database(
    entities = [StockItemEntity::class, ConsumptionEventEntity::class],
    version = 5,
    exportSchema = false,
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun stockItemDao(): StockItemDao
    abstract fun consumptionEventDao(): ConsumptionEventDao

    companion object {
        fun create(context: Context): AppDatabase =
            Room.databaseBuilder(context, AppDatabase::class.java, "sat_mobile.db")
                .addMigrations(
                    DatabaseMigrations.MIGRATION_1_2,
                    DatabaseMigrations.MIGRATION_2_3,
                    DatabaseMigrations.MIGRATION_3_4,
                    DatabaseMigrations.MIGRATION_4_5,
                )
                .build()
    }
}
