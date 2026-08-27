package com.example.shiory.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.shiory.entity.RoadmapItem;

public interface RoadmapItemRepository extends JpaRepository<RoadmapItem, UUID> {

	List<RoadmapItem> findByDayId(UUID dayId);

	List<RoadmapItem> findByDayIdOrderByStartsAtAscSortOrderAsc(UUID dayId);
}
