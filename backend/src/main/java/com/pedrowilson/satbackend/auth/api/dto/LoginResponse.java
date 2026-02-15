package com.pedrowilson.satbackend.auth.api.dto;

public record LoginResponse(
    String accessToken, String tokenType, long expiresInSeconds, String username, String role) {}

