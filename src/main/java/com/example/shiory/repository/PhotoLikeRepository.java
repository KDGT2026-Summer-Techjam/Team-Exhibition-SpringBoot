package com.example.shiory.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.shiory.entity.PhotoLike;

public interface PhotoLikeRepository extends JpaRepository<PhotoLike, UUID> {

	long countByPhotoId(UUID photoId);
}
