package com.example.shiory.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.shiory.constant.ShioriMemberStatus;
import com.example.shiory.dto.ShioriMemberResponse;
import com.example.shiory.entity.Shiori;
import com.example.shiory.entity.ShioriMember;
import com.example.shiory.entity.User;
import com.example.shiory.exception.BadRequestException;
import com.example.shiory.exception.ResourceNotFoundException;
import com.example.shiory.repository.ShioriMemberRepository;
import com.example.shiory.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class ShioriMemberService {

	private final ShioriMemberRepository shioriMemberRepository;
	private final UserRepository userRepository;
	private final ShioriAccessHelper accessHelper;

	@Transactional
	public void leave(UUID shioriId, UUID userId) {

		Shiori shiori = accessHelper.requireExistingShiori(shioriId);

		if (shiori.getOwnerId().equals(userId)) {
			throw new BadRequestException("作成者は退出できません");
		}

		ShioriMember member = shioriMemberRepository
				.findByShioriIdAndUserId(shioriId, userId)
				.orElseThrow(() -> new ResourceNotFoundException("メンバーが見つかりません"));

		if (!ShioriMemberStatus.ACTIVE.equals(member.getStatus())) {
			throw new BadRequestException("このメンバーは既に退出または追放されています");
		}

		member.setStatus(ShioriMemberStatus.LEFT);
		member.setLeftAt(OffsetDateTime.now());

		shioriMemberRepository.save(member);
	}

	@Transactional
	public void ban(UUID shioriId, UUID targetUserId, UUID callerId) {

		Shiori shiori = accessHelper.requireOwner(shioriId, callerId);

		if (targetUserId.equals(shiori.getOwnerId())) {
			throw new BadRequestException("作成者は追放できません");
		}

		ShioriMember member = shioriMemberRepository
				.findByShioriIdAndUserId(shioriId, targetUserId)
				.orElseThrow(() -> new ResourceNotFoundException("メンバーが見つかりません"));

		if (!ShioriMemberStatus.ACTIVE.equals(member.getStatus())) {
			throw new BadRequestException("このメンバーは既に退出または追放されています");
		}

		member.setStatus(ShioriMemberStatus.BANNED);
		member.setLeftAt(OffsetDateTime.now());

		shioriMemberRepository.save(member);
	}

	@Transactional(readOnly = true)
	public List<ShioriMemberResponse> getMembers(UUID shioriId, UUID callerId) {

		accessHelper.requireActiveMember(shioriId, callerId);

		return shioriMemberRepository
				.findByShioriIdAndStatus(shioriId, ShioriMemberStatus.ACTIVE)
				.stream()
				.map(member -> {

					User user = userRepository.findById(member.getUserId())
							.orElseThrow(() -> new ResourceNotFoundException("ユーザーが見つかりません"));

					return new ShioriMemberResponse(
							member.getUserId(),
							user.getUsername(),
							member.getRole(),
							member.getJoinedAt());
				})
				.toList();
	}
}