package com.example.shiory.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.shiory.entity.ShioriDay;

public interface ShioriDayRepository extends JpaRepository<ShioriDay, UUID> {

	boolean existsByShioriId(UUID shioriId);
}
