package com.pedrowilson.sat.mobile.data.remote

import android.content.Context
import com.pedrowilson.sat.mobile.BuildConfig
import com.pedrowilson.sat.mobile.data.local.entity.ConsumptionEventEntity
import java.io.IOException
import java.time.LocalDateTime
import java.time.temporal.ChronoUnit
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject

class BackendApiClient(
    context: Context,
    private val httpClient: OkHttpClient,
) {

    private val preferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    fun hasSavedSession(): Boolean =
        !preferences.getString(KEY_USERNAME, null).isNullOrBlank() &&
            !preferences.getString(KEY_PASSWORD, null).isNullOrBlank()

    fun getLastSuccessfulBackendContactAt(): String? =
        preferences.getString(KEY_LAST_BACKEND_CONTACT_AT, null)

    fun isBackendOfflineSimulationEnabled(): Boolean =
        preferences.getBoolean(KEY_SIMULATE_BACKEND_OFFLINE, false)

    fun setBackendOfflineSimulationEnabled(enabled: Boolean) {
        preferences.edit()
            .putBoolean(KEY_SIMULATE_BACKEND_OFFLINE, enabled)
            .apply()
    }

    fun clearSession() {
        preferences.edit()
            .remove(KEY_USERNAME)
            .remove(KEY_PASSWORD)
            .remove(KEY_ACCESS_TOKEN)
            .remove(KEY_TOKEN_EXPIRES_AT_SECONDS)
            .apply()
    }

    suspend fun login(username: String, password: String): LoginApiResult {
        if (isBackendOfflineSimulationEnabled()) {
            return LoginApiResult.Failure("Backend offline simulado pelo toggle do app")
        }

        val nowEpochSeconds = System.currentTimeMillis() / 1000
        val payload = JSONObject()
            .put("username", username)
            .put("password", password)

        return try {
            val responseBody = post("/api/v1/auth/login", payload)
            val responseJson = JSONObject(responseBody)
            val role = responseJson.optString("role", "")
            if (!"TECHNICIAN".equals(role, ignoreCase = true)) {
                return LoginApiResult.Failure("Usuario sem perfil de tecnico")
            }

            val accessToken = responseJson.getString("accessToken")
            val expiresInSeconds = responseJson.optLong("expiresInSeconds", 300)
            val expiresAt = nowEpochSeconds + expiresInSeconds

            preferences.edit()
                .putString(KEY_USERNAME, username)
                .putString(KEY_PASSWORD, password)
                .putString(KEY_ACCESS_TOKEN, accessToken)
                .putLong(KEY_TOKEN_EXPIRES_AT_SECONDS, expiresAt)
                .apply()

            LoginApiResult.Success
        } catch (exception: IOException) {
            LoginApiResult.Failure(exception.message ?: "Falha de comunicacao")
        }
    }

    suspend fun fetchStockItems(): List<RemoteStockItem> {
        val token = ensureAccessToken()
        val body = authorizedGet("/api/v1/technician/consumptions/stock-items", token)
        val jsonArray = JSONArray(body)

        return buildList {
            for (index in 0 until jsonArray.length()) {
                val item = jsonArray.getJSONObject(index)
                add(
                    RemoteStockItem(
                        id = item.getLong("id"),
                        sku = item.getString("sku"),
                        name = item.getString("name"),
                        quantityAvailable = item.getInt("quantityAvailable"),
                        minimumThreshold = item.getInt("minimumThreshold"),
                    )
                )
            }
        }
    }

    suspend fun syncConsumptionBatch(
        pendingEvents: List<ConsumptionEventEntity>
    ): List<SyncConsumptionResult> {
        if (pendingEvents.isEmpty()) return emptyList()

        val token = ensureAccessToken()
        val events = JSONArray()
        pendingEvents.forEach { event ->
            events.put(
                JSONObject()
                    .put("externalEventId", event.externalEventId)
                    .put("itemId", event.itemId)
                    .put("quantity", event.quantity)
                    .put("occurredAt", event.occurredAt)
            )
        }

        val payload = JSONObject().put("events", events)
        val responseBody = authorizedPost("/api/v1/technician/consumptions/batch", payload, token)
        val responseJson = JSONObject(responseBody)
        val resultsJson = responseJson.optJSONArray("results") ?: JSONArray()

        return buildList {
            for (index in 0 until resultsJson.length()) {
                val item = resultsJson.getJSONObject(index)
                add(
                    SyncConsumptionResult(
                        externalEventId = item.getString("externalEventId"),
                        status = item.optString("status", "UNKNOWN"),
                        reason =
                            if (item.has("reason") && !item.isNull("reason")) {
                                item.getString("reason")
                            } else {
                                null
                            },
                    )
                )
            }
        }
    }

    private suspend fun ensureAccessToken(): String {
        val savedToken = preferences.getString(KEY_ACCESS_TOKEN, null)
        val tokenExpiresAtEpochSeconds = preferences.getLong(KEY_TOKEN_EXPIRES_AT_SECONDS, 0L)
        val nowEpochSeconds = System.currentTimeMillis() / 1000

        if (!savedToken.isNullOrBlank() && tokenExpiresAtEpochSeconds > nowEpochSeconds + 30) {
            return savedToken
        }

        val username = preferences.getString(KEY_USERNAME, null)
        val password = preferences.getString(KEY_PASSWORD, null)
        if (username.isNullOrBlank() || password.isNullOrBlank()) {
            throw IOException("Sessao nao iniciada")
        }

        return when (val loginResult = login(username, password)) {
            LoginApiResult.Success -> preferences.getString(KEY_ACCESS_TOKEN, null)
                ?: throw IOException("Token nao encontrado apos login")

            is LoginApiResult.Failure -> throw IOException(loginResult.message)
        }
    }

    private suspend fun post(path: String, payload: JSONObject): String = withContext(Dispatchers.IO) {
        ensureBackendAvailable()
        val request = Request.Builder()
            .url(BuildConfig.API_BASE_URL + path)
            .post(payload.toString().toRequestBody(JSON_MEDIA_TYPE))
            .addHeader("Content-Type", "application/json")
            .build()

        httpClient.newCall(request).execute().use { response ->
            val body = response.body?.string().orEmpty()
            markBackendContactNow()
            if (!response.isSuccessful) {
                throw IOException("HTTP ${response.code}: $body")
            }
            body
        }
    }

    private suspend fun authorizedGet(path: String, token: String): String = withContext(Dispatchers.IO) {
        ensureBackendAvailable()
        val request = Request.Builder()
            .url(BuildConfig.API_BASE_URL + path)
            .get()
            .addHeader("Authorization", "Bearer $token")
            .build()

        httpClient.newCall(request).execute().use { response ->
            val body = response.body?.string().orEmpty()
            markBackendContactNow()
            if (response.code == 401 || response.code == 403) {
                preferences.edit()
                    .remove(KEY_ACCESS_TOKEN)
                    .remove(KEY_TOKEN_EXPIRES_AT_SECONDS)
                    .apply()
            }
            if (!response.isSuccessful) {
                throw IOException("HTTP ${response.code}: $body")
            }
            body
        }
    }

    private suspend fun authorizedPost(path: String, payload: JSONObject, token: String): String =
        withContext(Dispatchers.IO) {
            ensureBackendAvailable()
            val request = Request.Builder()
                .url(BuildConfig.API_BASE_URL + path)
                .post(payload.toString().toRequestBody(JSON_MEDIA_TYPE))
                .addHeader("Content-Type", "application/json")
                .addHeader("Authorization", "Bearer $token")
                .build()

            httpClient.newCall(request).execute().use { response ->
                val body = response.body?.string().orEmpty()
                markBackendContactNow()
                if (response.code == 401 || response.code == 403) {
                    preferences.edit()
                        .remove(KEY_ACCESS_TOKEN)
                        .remove(KEY_TOKEN_EXPIRES_AT_SECONDS)
                        .apply()
                }
                if (!response.isSuccessful) {
                    throw IOException("HTTP ${response.code}: $body")
                }
                body
            }
        }

    private fun markBackendContactNow() {
        val now = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS).toString()
        preferences.edit()
            .putString(KEY_LAST_BACKEND_CONTACT_AT, now)
            .apply()
    }

    private fun ensureBackendAvailable() {
        if (isBackendOfflineSimulationEnabled()) {
            throw IOException("Backend offline simulado pelo toggle do app")
        }
    }

    companion object {
        private val JSON_MEDIA_TYPE = "application/json; charset=utf-8".toMediaType()
        private const val PREFS_NAME = "sat_mobile_prefs"
        private const val KEY_USERNAME = "username"
        private const val KEY_PASSWORD = "password"
        private const val KEY_ACCESS_TOKEN = "access_token"
        private const val KEY_TOKEN_EXPIRES_AT_SECONDS = "token_expires_at_seconds"
        private const val KEY_SIMULATE_BACKEND_OFFLINE = "simulate_backend_offline"
        private const val KEY_LAST_BACKEND_CONTACT_AT = "last_backend_contact_at"
    }
}

sealed interface LoginApiResult {
    data object Success : LoginApiResult
    data class Failure(val message: String) : LoginApiResult
}

data class RemoteStockItem(
    val id: Long,
    val sku: String,
    val name: String,
    val quantityAvailable: Int,
    val minimumThreshold: Int,
)

data class SyncConsumptionResult(
    val externalEventId: String,
    val status: String,
    val reason: String?,
)
