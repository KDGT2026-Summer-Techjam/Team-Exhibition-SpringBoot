package com.example.shiory.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.shiory.dto.ShioriMemberResponse;
import com.example.shiory.service.ShioriMemberService;

@RestController
@RequestMapping("/api/shioris")
public class ShioriMemberController {

    private final ShioriMemberService shioriMemberService;

    public ShioriMemberController(ShioriMemberService shioriMemberService) {
        this.shioriMemberService = shioriMemberService;
    }

    @DeleteMapping("/{shioriId}/members/me")
    public ResponseEntity<Void> leave(
            @PathVariable UUID shioriId,
            Authentication authentication) {

        UUID userId = UUID.fromString(authentication.getName());

        shioriMemberService.leave(shioriId, userId);

        return ResponseEntity.noContent().build();
    }
    
    @PatchMapping("/{shioriId}/members/{memberId}/ban")
    public ResponseEntity<Void> ban(
            @PathVariable UUID shioriId,
            @PathVariable UUID memberId,
            Authentication authentication) {

        UUID userId = UUID.fromString(authentication.getName());

        shioriMemberService.ban(
                shioriId,
                memberId,
                userId
        );

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{shioriId}/members")
    public ResponseEntity<List<ShioriMemberResponse>> getMembers(
            @PathVariable UUID shioriId,
            Authentication authentication) {

        UUID userId = UUID.fromString(authentication.getName());

        return ResponseEntity.ok(shioriMemberService.getMembers(shioriId, userId));
    }
}