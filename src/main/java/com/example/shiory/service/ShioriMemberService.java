package com.example.shiory.service;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.shiory.entity.Shiori;
import com.example.shiory.entity.ShioriMember;
import com.example.shiory.repository.ShioriMemberRepository;
import com.example.shiory.repository.ShioriRepository;

@Service
public class ShioriMemberService {

    private final ShioriMemberRepository shioriMemberRepository;
    private final ShioriRepository shioriRepository;

    public ShioriMemberService(
            ShioriMemberRepository shioriMemberRepository,
            ShioriRepository shioriRepository) {

        this.shioriMemberRepository = shioriMemberRepository;
        this.shioriRepository = shioriRepository;
    }

    @Transactional
    public void leave(UUID shioriId, UUID userId) {

        ShioriMember member = shioriMemberRepository
                .findByShioriIdAndUserId(shioriId, userId)
                .orElseThrow(() ->
                        new RuntimeException("Member not found"));

        if (!"active".equals(member.getStatus())) {
            throw new RuntimeException("Member is not active");
        }

        member.setStatus("left");
        member.setLeftAt(OffsetDateTime.now());

        shioriMemberRepository.save(member);
    }

    @Transactional
    public void ban(UUID shioriId, UUID memberId, UUID userId) {

        Shiori shiori = shioriRepository.findById(shioriId)
                .orElseThrow(() ->
                        new RuntimeException("Shiori not found"));

        if (!shiori.getOwnerId().equals(userId)) {
            throw new RuntimeException("Only owner can ban members");
        }

        ShioriMember member = shioriMemberRepository
                .findByIdAndShioriId(memberId, shioriId)
                .orElseThrow(() ->
                        new RuntimeException("Member not found"));

        if (member.getUserId().equals(shiori.getOwnerId())) {
            throw new RuntimeException("Owner cannot be banned");
        }

        if (!"active".equals(member.getStatus())) {
            throw new RuntimeException("Member is not active");
        }

        member.setStatus("banned");
        member.setLeftAt(OffsetDateTime.now());

        shioriMemberRepository.save(member);
    }
}