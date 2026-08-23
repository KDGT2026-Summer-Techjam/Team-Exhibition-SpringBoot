package com.example.shiory.service;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.shiory.dto.ShioriCreateRequest;
import com.example.shiory.entity.Shiori;
import com.example.shiory.entity.ShioriMember;
import com.example.shiory.repository.ShioriMemberRepository;
import com.example.shiory.repository.ShioriRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShioriService {

	private final ShioriRepository shioriRepository;
	private final ShioriMemberRepository shioriMemberRepository;
	private final PasswordEncoder passwordEncoder;

	public Shiori createShiori(ShioriCreateRequest request, UUID ownerId) {

		Shiori shiori = new Shiori();

		shiori.setOwnerId(ownerId);
		shiori.setTitle(request.getTitle());
		shiori.setPasswordHash(passwordEncoder.encode(request.getPassword()));

		Shiori savedShiori = shioriRepository.save(shiori);

		ShioriMember ownerMember = new ShioriMember();

		ownerMember.setShioriId(savedShiori.getId());
		ownerMember.setUserId(ownerId);
		ownerMember.setRole("owner");
		ownerMember.setStatus("active");
		ownerMember.setJoinedAt(OffsetDateTime.now());

		shioriMemberRepository.save(ownerMember);

		return savedShiori;
	}
}
