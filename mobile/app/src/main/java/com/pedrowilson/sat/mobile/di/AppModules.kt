package com.pedrowilson.sat.mobile.di

import com.pedrowilson.sat.mobile.data.local.AppDatabase
import com.pedrowilson.sat.mobile.data.remote.BackendApiClient
import com.pedrowilson.sat.mobile.data.repository.InventoryRepositoryImpl
import com.pedrowilson.sat.mobile.domain.InventoryRepository
import com.pedrowilson.sat.mobile.ui.inventory.InventoryViewModel
import okhttp3.OkHttpClient
import org.koin.android.ext.koin.androidContext
import org.koin.androidx.viewmodel.dsl.viewModel
import org.koin.dsl.module

val appModule = module {
    single { OkHttpClient.Builder().build() }

    single { AppDatabase.create(androidContext()) }
    single { get<AppDatabase>().stockItemDao() }
    single { get<AppDatabase>().consumptionEventDao() }

    single { BackendApiClient(androidContext(), get()) }

    single<InventoryRepository> {
        InventoryRepositoryImpl(
            context = androidContext(),
            database = get(),
            stockItemDao = get(),
            consumptionEventDao = get(),
            backendApiClient = get(),
        )
    }

    viewModel { InventoryViewModel(get()) }
}
