package com.example.shiory.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
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
@Table(name = "shiori_days")
@Getter
@Setter
public class ShioriDay {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@Column(name = "shiori_id", nullable = false)
	private UUID shioriId;

	@Column(name = "trip_date", nullable = false)
	private LocalDate tripDate;

	@Column(name = "day_number", nullable = false)
	private int dayNumber;

	@Column
	private String title;

	@Column
	private String notes;

	@Column(name = "estimated_cost")
	private BigDecimal estimatedCost;

	@Column(name = "representative_photo_id")
	private UUID representativePhotoId;

	@Column(name = "is_editable", nullable = false)
	private boolean editable = true;

	@Column(name = "is_comment_open", nullable = false)
	private boolean commentOpen = true;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private OffsetDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at", nullable = false)
	private OffsetDateTime updatedAt;
}
