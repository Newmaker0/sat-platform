package com.pedrowilson.satbackend.auth.api;

import com.pedrowilson.satbackend.auth.api.dto.LoginRequest;
import com.pedrowilson.satbackend.auth.api.dto.LoginResponse;
import com.pedrowilson.satbackend.auth.application.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/login")
  public LoginResponse login(@Valid @RequestBody LoginRequest request) {
    return authService.login(request);
  }

  @PostMapping("/admin/login")
  public LoginResponse loginAdmin(@Valid @RequestBody LoginRequest request) {
    return authService.loginAdmin(request);
  }
}
