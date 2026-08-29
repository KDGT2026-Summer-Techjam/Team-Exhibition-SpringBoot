package com.example.shiory.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.shiory.entity.Photo;

public interface PhotoRepository extends JpaRepository<Photo, UUID> {

	long countByDayIdAndUserIdAndDeletedFalse(UUID dayId, UUID userId);

	List<Photo> findByDayId(UUID dayId);

	List<Photo> findByShioriIdOrderByCreatedAtAsc(UUID shioriId);
}
