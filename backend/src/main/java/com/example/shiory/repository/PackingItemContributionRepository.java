package com.example.shiory.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.shiory.entity.PackingItemContribution;

public interface PackingItemContributionRepository extends JpaRepository<PackingItemContribution, UUID> {

	List<PackingItemContribution> findByPackingItemIdOrderByCreatedAtAsc(UUID packingItemId);

	Optional<PackingItemContribution> findByPackingItemIdAndUserId(UUID packingItemId, UUID userId);

	void deleteByPackingItemId(UUID packingItemId);

	long countByPackingItemId(UUID packingItemId);
}
