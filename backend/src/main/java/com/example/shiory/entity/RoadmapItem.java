package com.example.shiory.entity;

import java.math.BigDecimal;
import java.time.LocalTime;
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
@Table(name = "roadmap_items")
@Getter
@Setter
public class RoadmapItem {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@Column(name = "day_id", nullable = false)
	private UUID dayId;

	@Column(name = "starts_at", nullable = false)
	private LocalTime startsAt;

	@Column(name = "ends_at")
	private LocalTime endsAt;

	@Column(nullable = false)
	private String title;

	@Column
	private BigDecimal amount;

	@Column(name = "sort_order")
	private Integer sortOrder;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private OffsetDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at", nullable = false)
	private OffsetDateTime updatedAt;
}
