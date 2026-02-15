package com.pedrowilson.satbackend.config;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

@Component
public class StartupBannerListener {

  @EventListener(ApplicationReadyEvent.class)
  public void onApplicationReady() {
    ClassPathResource bannerResource = new ClassPathResource("banner.txt");
    if (!bannerResource.exists()) {
      return;
    }

    try (InputStream inputStream = bannerResource.getInputStream()) {
      String banner = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
      System.out.println();
      System.out.println(banner);
    } catch (IOException ignored) {
      // Non-critical: app startup should not fail due to banner rendering.
    }
  }
}
