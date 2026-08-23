package com.example.shiory.entity;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "shiori_members")
@Getter
@Setter
public class ShioriMember {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@Column(name = "shiori_id", nullable = false)
	private UUID shioriId;

	@Column(name = "user_id", nullable = false)
	private UUID userId;

	@Column(nullable = false)
	private String role;

	@Column(nullable = false)
	private String status;

	@Column(name = "password_verified_at")
	private OffsetDateTime passwordVerifiedAt;

	@Column(name = "joined_at")
	private OffsetDateTime joinedAt;

	@Column(name = "left_at")
	private OffsetDateTime leftAt;
}
