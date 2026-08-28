package com.example.shiory.service;

import java.util.UUID;

import org.springframework.stereotype.Component;

import com.example.shiory.constant.ShioriMemberStatus;
import com.example.shiory.entity.Shiori;
import com.example.shiory.entity.ShioriDay;
import com.example.shiory.entity.ShioriMember;
import com.example.shiory.exception.ForbiddenException;
import com.example.shiory.exception.ResourceNotFoundException;
import com.example.shiory.repository.ShioriMemberRepository;
import com.example.shiory.repository.ShioriRepository;

import lombok.RequiredArgsConstructor;

/**
 * しおりのメンバー判定・ページ別編集権限を共通化する。
 */
@Component
@RequiredArgsConstructor
public class ShioriAccessHelper {

	private final ShioriRepository shioriRepository;
	private final ShioriMemberRepository shioriMemberRepository;

	public Shiori requireExistingShiori(UUID shioriId) {

		return shioriRepository.findById(shioriId)
				.filter(shiori -> shiori.getDeletedAt() == null)
				.orElseThrow(() -> new ResourceNotFoundException("しおりが見つかりません"));
	}

	public ShioriMember requireActiveMember(UUID shioriId, UUID callerId) {

		requireExistingShiori(shioriId);

		ShioriMember member = shioriMemberRepository
				.findByShioriIdAndUserId(shioriId, callerId)
				.orElseThrow(() -> new ForbiddenException("このしおりのメンバーではありません"));

		if (!ShioriMemberStatus.ACTIVE.equals(member.getStatus())) {
			throw new ForbiddenException("このしおりのメンバーではありません");
		}

		return member;
	}

	public Shiori requireActiveMemberWithShiori(UUID shioriId, UUID callerId) {

		Shiori shiori = requireExistingShiori(shioriId);
		requireActiveMember(shioriId, callerId);

		return shiori;
	}

	public Shiori requireOwner(UUID shioriId, UUID callerId) {

		Shiori shiori = requireExistingShiori(shioriId);

		if (!shiori.getOwnerId().equals(callerId)) {
			throw new ForbiddenException("この操作は作成者のみ行えます");
		}

		return shiori;
	}

	public boolean isOwner(Shiori shiori, UUID callerId) {
		return shiori.getOwnerId().equals(callerId);
	}

	public boolean canEditTravelPlan(Shiori shiori, UUID callerId) {
		return isOwner(shiori, callerId) || shiori.isEditable();
	}

	public void requireTravelPlanEdit(Shiori shiori, UUID callerId) {

		requireActiveMember(shiori.getId(), callerId);

		if (!canEditTravelPlan(shiori, callerId)) {
			throw new ForbiddenException("現在このしおりは編集が許可されていません");
		}
	}

	public boolean canEditDay(Shiori shiori, ShioriDay day, UUID callerId) {
		return isOwner(shiori, callerId) || day.isEditable();
	}

	public void requireDayEdit(Shiori shiori, ShioriDay day, UUID callerId) {

		requireActiveMember(shiori.getId(), callerId);

		if (!canEditDay(shiori, day, callerId)) {
			throw new ForbiddenException("現在この日次ページは編集が許可されていません");
		}
	}
}
