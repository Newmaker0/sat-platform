package com.pedrowilson.satbackend.auth.application;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtTokenService {

  private final SecretKey secretKey;
  private final long expirationSeconds;

  public JwtTokenService(
      @Value("${sat.security.jwt.secret}") String jwtSecret,
      @Value("${sat.security.jwt.expiration-seconds:7200}") long expirationSeconds) {
    this.secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    this.expirationSeconds = expirationSeconds;
  }

  public String generateToken(String username, String role) {
    Instant issuedAt = Instant.now();
    Instant expiresAt = issuedAt.plusSeconds(expirationSeconds);

    return Jwts.builder()
        .subject(username)
        .claim("role", role)
        .issuedAt(Date.from(issuedAt))
        .expiration(Date.from(expiresAt))
        .signWith(secretKey)
        .compact();
  }

  public Optional<JwtAuthenticatedUser> parseToken(String token) {
    try {
      Claims claims =
          Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload();

      String username = claims.getSubject();
      String role = claims.get("role", String.class);

      if (username == null || username.isBlank() || role == null || role.isBlank()) {
        return Optional.empty();
      }

      return Optional.of(new JwtAuthenticatedUser(username, role));
    } catch (JwtException | IllegalArgumentException ex) {
      return Optional.empty();
    }
  }

  public long getExpirationSeconds() {
    return expirationSeconds;
  }

  public record JwtAuthenticatedUser(String username, String role) {}
}

