package com.example.shiory.service;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.shiory.constant.ShioriMemberStatus;
import com.example.shiory.entity.Shiori;
import com.example.shiory.entity.ShioriMember;
import com.example.shiory.exception.BadRequestException;
import com.example.shiory.exception.ForbiddenException;
import com.example.shiory.exception.ResourceNotFoundException;
import com.example.shiory.repository.ShioriMemberRepository;
import com.example.shiory.repository.ShioriRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class ShioriMemberService {

	private final ShioriMemberRepository shioriMemberRepository;
	private final ShioriRepository shioriRepository;

	@Transactional
	public void leave(UUID shioriId, UUID userId) {

		Shiori shiori = shioriRepository.findById(shioriId)
				.orElseThrow(() -> new ResourceNotFoundException("しおりが見つかりません"));

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
	public void ban(UUID shioriId, UUID memberId, UUID userId) {

		Shiori shiori = shioriRepository.findById(shioriId)
				.orElseThrow(() -> new ResourceNotFoundException("しおりが見つかりません"));

		if (!shiori.getOwnerId().equals(userId)) {
			throw new ForbiddenException("メンバーの追放は作成者のみ行えます");
		}

		ShioriMember member = shioriMemberRepository
				.findByIdAndShioriId(memberId, shioriId)
				.orElseThrow(() -> new ResourceNotFoundException("メンバーが見つかりません"));

		if (member.getUserId().equals(shiori.getOwnerId())) {
			throw new BadRequestException("作成者は追放できません");
		}

		if (!ShioriMemberStatus.ACTIVE.equals(member.getStatus())) {
			throw new BadRequestException("このメンバーは既に退出または追放されています");
		}

		member.setStatus(ShioriMemberStatus.BANNED);
		member.setLeftAt(OffsetDateTime.now());

		shioriMemberRepository.save(member);
	}
}