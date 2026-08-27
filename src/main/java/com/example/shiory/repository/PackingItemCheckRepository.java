package com.example.shiory.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.shiory.entity.PackingItemCheck;

public interface PackingItemCheckRepository extends JpaRepository<PackingItemCheck, UUID> {
	
	long countByPackingItemId(UUID packingItemId);

	boolean existsByPackingItemIdAndUserId(
			UUID packingItemId,
			UUID userId);

	void deleteByPackingItemIdAndUserId(
			UUID packingItemId,
			UUID userId);
}
