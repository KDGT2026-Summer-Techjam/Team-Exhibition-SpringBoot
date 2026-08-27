package com.example.shiory.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.shiory.entity.ShioriMember;

public interface ShioriMemberRepository extends JpaRepository<ShioriMember, UUID> {

	Optional<ShioriMember> findByShioriIdAndUserId(
			    UUID shioriId,
			    UUID userId
	);

	Optional<ShioriMember> findByIdAndShioriId(
			    UUID memberId,
			    UUID shioriId
	);
	boolean existsByShioriIdAndStatusAndUserIdNot(
			UUID shioriId,
			String status,
			UUID userId
	);

	List<ShioriMember> findByShioriIdAndStatus(UUID shioriId, String status);

	List<ShioriMember> findByUserIdAndStatus(UUID userId, String status);

}
