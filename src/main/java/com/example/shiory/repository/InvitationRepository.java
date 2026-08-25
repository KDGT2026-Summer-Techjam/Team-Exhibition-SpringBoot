package com.example.shiory.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.shiory.entity.Invitation;

public interface InvitationRepository extends JpaRepository<Invitation, UUID> {

	Optional<Invitation> findByToken(String token);
}
