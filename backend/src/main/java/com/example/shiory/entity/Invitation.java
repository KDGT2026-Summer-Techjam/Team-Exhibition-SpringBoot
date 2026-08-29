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

import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "invitations")
@Getter
@Setter
public class Invitation {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@Column(name = "shiori_id", nullable = false)
	private UUID shioriId;

	@Column(name = "inviter_id", nullable = false)
	private UUID inviterId;

	@Column(name = "invitee_email")
	private String inviteeEmail;

	@Column
	private String message;

	@Column(nullable = false, unique = true)
	private String token;

	@Column(nullable = false)
	private String status;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private OffsetDateTime createdAt;

	@Column(name = "accepted_at")
	private OffsetDateTime acceptedAt;

	@Column(name = "accepted_user_id")
	private UUID acceptedUserId;
}
