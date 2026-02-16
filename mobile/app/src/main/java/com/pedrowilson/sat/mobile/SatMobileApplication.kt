package com.pedrowilson.sat.mobile

import android.app.Application
import com.pedrowilson.sat.mobile.di.appModule
import com.pedrowilson.sat.mobile.work.SyncWorkScheduler
import org.koin.android.ext.koin.androidContext
import org.koin.core.context.startKoin

class SatMobileApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        startKoin {
            androidContext(this@SatMobileApplication)
            modules(appModule)
        }

        SyncWorkScheduler.enqueuePeriodic(this)
    }
}
