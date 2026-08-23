package com.example.shiory.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.shiory.entity.ShioriMember;

public interface ShioriMemberRepository extends JpaRepository<ShioriMember, UUID> {
}
