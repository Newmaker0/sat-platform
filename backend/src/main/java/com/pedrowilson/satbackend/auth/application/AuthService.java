package com.pedrowilson.satbackend.auth.application;

import com.pedrowilson.satbackend.auth.api.dto.LoginRequest;
import com.pedrowilson.satbackend.auth.api.dto.LoginResponse;
import com.pedrowilson.satbackend.auth.domain.UserRole;
import com.pedrowilson.satbackend.auth.repository.AppUserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

  private final AppUserRepository appUserRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtTokenService jwtTokenService;

  public AuthService(
      AppUserRepository appUserRepository,
      PasswordEncoder passwordEncoder,
      JwtTokenService jwtTokenService) {
    this.appUserRepository = appUserRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtTokenService = jwtTokenService;
  }

  public LoginResponse login(LoginRequest request) {
    return loginInternal(request, null);
  }

  public LoginResponse loginAdmin(LoginRequest request) {
    return loginInternal(request, UserRole.ADMIN);
  }

  private LoginResponse loginInternal(LoginRequest request, UserRole requiredRole) {
    String username = request.username().trim();

    var appUser =
        appUserRepository
            .findByUsernameIgnoreCase(username)
            .orElseThrow(() -> invalidCredentialsException());

    if (!appUser.isActive() || !passwordEncoder.matches(request.password(), appUser.getPasswordHash())) {
      throw invalidCredentialsException();
    }

    if (requiredRole != null && appUser.getRole() != requiredRole) {
      throw invalidCredentialsException();
    }

    String accessToken = jwtTokenService.generateToken(appUser.getUsername(), appUser.getRole().name());

    return new LoginResponse(
        accessToken,
        "Bearer",
        jwtTokenService.getExpirationSeconds(),
        appUser.getUsername(),
        appUser.getRole().name());
  }

  private ResponseStatusException invalidCredentialsException() {
    return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
  }
}
