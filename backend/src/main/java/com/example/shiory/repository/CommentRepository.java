package com.example.shiory.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.shiory.entity.Comment;

public interface CommentRepository extends JpaRepository<Comment, UUID> {

	List<Comment> findByShioriIdOrderByCreatedAtAsc(UUID shioriId);

	void deleteByTargetTypeAndTargetId(
			String targetType,
			UUID targetId
	);
}
