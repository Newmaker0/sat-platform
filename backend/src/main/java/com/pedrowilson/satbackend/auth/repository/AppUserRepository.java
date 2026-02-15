package com.pedrowilson.satbackend.auth.repository;

import com.pedrowilson.satbackend.auth.domain.AppUser;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {

  Optional<AppUser> findByUsernameIgnoreCase(String username);
}

