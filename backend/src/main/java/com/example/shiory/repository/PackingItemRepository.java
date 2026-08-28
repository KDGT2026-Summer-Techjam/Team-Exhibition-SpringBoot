package com.example.shiory.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.shiory.entity.PackingItem;

public interface PackingItemRepository extends JpaRepository<PackingItem, UUID> {

	long countByShioriId(UUID shioriId);

	List<PackingItem> findByShioriIdOrderBySortOrderAscCreatedAtAsc(UUID shioriId);
}
