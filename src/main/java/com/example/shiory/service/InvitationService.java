package com.example.shiory.service;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.shiory.dto.InvitationCreateRequest;
import com.example.shiory.entity.Invitation;
import com.example.shiory.entity.Shiori;
import com.example.shiory.entity.ShioriMember;
import com.example.shiory.repository.InvitationRepository;
import com.example.shiory.repository.ShioriMemberRepository;
import com.example.shiory.repository.ShioriRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InvitationService {

	private final InvitationRepository invitationRepository;
	private final ShioriRepository shioriRepository;
	private final ShioriMemberRepository shioriMemberRepository;
	private final PasswordEncoder passwordEncoder;

	public Invitation createInvitation(UUID shioriId, UUID inviterId, InvitationCreateRequest request) {

		Shiori shiori = shioriRepository.findById(shioriId)
				.orElseThrow(() -> new IllegalArgumentException("しおりが見つかりません"));

		if (!shiori.getOwnerId().equals(inviterId)) {
			throw new IllegalArgumentException("招待は作成者のみ行えます");
		}

		Invitation invitation = new Invitation();

		invitation.setShioriId(shioriId);
		invitation.setInviterId(inviterId);
		invitation.setInviteeEmail(request.getInviteeEmail());
		invitation.setMessage(request.getMessage());
		invitation.setToken(UUID.randomUUID().toString());
		invitation.setStatus("pending");

		return invitationRepository.save(invitation);
	}

	public void acceptInvitation(String token, UUID userId, String password) {

		Invitation invitation = invitationRepository.findByToken(token)
				.orElseThrow(() -> new IllegalArgumentException("招待が見つかりません"));

		if (!"pending".equals(invitation.getStatus())) {
			throw new IllegalArgumentException("この招待は既に処理されています");
		}

		Shiori shiori = shioriRepository.findById(invitation.getShioriId())
				.orElseThrow(() -> new IllegalArgumentException("しおりが見つかりません"));

		if (!passwordEncoder.matches(password, shiori.getPasswordHash())) {
			throw new IllegalArgumentException("しおりのパスワードが正しくありません");
		}

		invitation.setStatus("accepted");
		invitation.setAcceptedAt(OffsetDateTime.now());
		invitation.setAcceptedUserId(userId);

		invitationRepository.save(invitation);

		ShioriMember member = shioriMemberRepository
				.findByShioriIdAndUserId(invitation.getShioriId(), userId)
				.orElseGet(ShioriMember::new);
		OffsetDateTime now = OffsetDateTime.now();

		member.setShioriId(invitation.getShioriId());
		member.setUserId(userId);
		member.setRole("member");
		member.setStatus("active");
		member.setJoinedAt(now);
		member.setPasswordVerifiedAt(now);

		shioriMemberRepository.save(member);
	}
}
