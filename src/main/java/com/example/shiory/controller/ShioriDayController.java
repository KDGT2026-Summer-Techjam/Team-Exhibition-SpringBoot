package com.example.shiory.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.shiory.dto.ShioriDayInsertRequest;
import com.example.shiory.dto.ShioriDayResponse;
import com.example.shiory.dto.ShioriDayUpdateRequest;
import com.example.shiory.service.ShioriDayService;

@RestController
public class ShioriDayController {

      private final ShioriDayService shioriDayService;

      public ShioriDayController(ShioriDayService shioriDayService) {
              this.shioriDayService = shioriDayService;
      }

      @PostMapping("/api/shioris/{shioriId}/days")
      public ResponseEntity<Void> insertDay(
                      @PathVariable UUID shioriId,
                      @Valid @RequestBody ShioriDayInsertRequest request) {

              shioriDayService.insertDay(shioriId, currentUserId(), request);

              return ResponseEntity.ok().build();
      }

      @GetMapping("/api/shioris/{shioriId}/days")
      public ResponseEntity<List<ShioriDayResponse>> getDays(@PathVariable UUID shioriId) {

              return ResponseEntity.ok(shioriDayService.getDays(shioriId, currentUserId()));
      }

      @PatchMapping("/api/shiori-days/{dayId}")
      public ResponseEntity<Void> updateDay(
                      @PathVariable UUID dayId,
                      @RequestBody ShioriDayUpdateRequest request) {

              shioriDayService.updateDay(dayId, currentUserId(), request);

              return ResponseEntity.ok().build();
      }

      @DeleteMapping("/api/shiori-days/{dayId}")
      public ResponseEntity<Void> deleteDay(@PathVariable UUID dayId) {

              shioriDayService.deleteDay(dayId, currentUserId());

              return ResponseEntity.noContent().build();
      }

      private UUID currentUserId() {

              String principal = (String) SecurityContextHolder.getContext()
                              .getAuthentication()
                              .getPrincipal();

              return UUID.fromString(principal);
      }
}