package com.example.shiory.entity;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "photos")
@Getter
@Setter
public class Photo {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@Column(name = "shiori_id", nullable = false)
	private UUID shioriId;

	@Column(name = "day_id", nullable = false)
	private UUID dayId;

	@Column(name = "user_id", nullable = false)
	private UUID userId;

	@Column(name = "image_path", nullable = false)
	private String imagePath;

	@Column(name = "is_deleted", nullable = false)
	private boolean deleted = false;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private OffsetDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at", nullable = false)
	private OffsetDateTime updatedAt;
}
