package com.example.shiory.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.shiory.constant.ShioriMemberStatus;
import com.example.shiory.dto.PackingItemCreateRequest;
import com.example.shiory.entity.PackingItem;
import com.example.shiory.entity.PackingItemCheck;
import com.example.shiory.entity.Shiori;
import com.example.shiory.entity.ShioriMember;
import com.example.shiory.exception.BadRequestException;
import com.example.shiory.exception.ForbiddenException;
import com.example.shiory.exception.ResourceNotFoundException;
import com.example.shiory.repository.PackingItemCheckRepository;
import com.example.shiory.repository.PackingItemRepository;
import com.example.shiory.repository.ShioriMemberRepository;
import com.example.shiory.repository.ShioriRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class PackingItemService {
	
	private final PackingItemRepository packingItemRepository;
	private final PackingItemCheckRepository packingItemCheckRepository;
	private final ShioriRepository shioriRepository;
	private final ShioriMemberRepository shioriMemberRepository;

	public PackingItem createPackingItem(
			UUID shioriId,
			UUID callerId,
			PackingItemCreateRequest request) {

		Shiori shiori = requireEditableMember(shioriId, callerId);

		PackingItem item = new PackingItem();

		item.setShioriId(shiori.getId());
		item.setName(request.getName());
		item.setRequiredCount(request.getRequiredCount());

		return packingItemRepository.save(item);
	}

	private Shiori requireEditableMember(UUID shioriId, UUID callerId) {

		Shiori shiori = shioriRepository.findById(shioriId)
				.orElseThrow(() ->
						new ResourceNotFoundException("しおりが見つかりません"));

		ShioriMember member = shioriMemberRepository.findByShioriIdAndUserId(shioriId, callerId)
				.orElseThrow(() ->
						new ForbiddenException("このしおりのメンバーではありません"));

		if (!ShioriMemberStatus.ACTIVE.equals(member.getStatus())) {
			throw new ForbiddenException("このしおりのメンバーではありません");
		}
		boolean isOwner = shiori.getOwnerId().equals(callerId);

		if (!shiori.isEditable() && !isOwner) {
			throw new ForbiddenException("現在このしおりは編集が許可されていません");
		}

		return shiori;
	}

	public void checkItem(UUID itemId, UUID callerId) {

		PackingItem item = packingItemRepository.findById(itemId)
				.orElseThrow(() ->
						new ResourceNotFoundException("持ち物が見つかりません"));

		requireActiveMember(item.getShioriId(), callerId);

		if (packingItemCheckRepository.existsByPackingItemIdAndUserId(itemId, callerId)) {
			throw new BadRequestException("既にチェック済みです");
		}

		long checkedCount = packingItemCheckRepository.countByPackingItemId(itemId);

		if (checkedCount >= item.getRequiredCount()) {
			throw new BadRequestException("必要数に達しているためチェックできません");
		}

		PackingItemCheck check = new PackingItemCheck();

		check.setPackingItemId(itemId);
		check.setUserId(callerId);

		packingItemCheckRepository.save(check);
	}

	private void requireActiveMember(UUID shioriId, UUID callerId) {

		shioriRepository.findById(shioriId)
				.orElseThrow(() ->
						new ResourceNotFoundException("しおりが見つかりません"));

		ShioriMember member = shioriMemberRepository.findByShioriIdAndUserId(shioriId, callerId)
				.orElseThrow(() ->
						new ForbiddenException("このしおりのメンバーではありません"));

		if (!ShioriMemberStatus.ACTIVE.equals(member.getStatus())) {
			throw new ForbiddenException("このしおりのメンバーではありません");
		}
	}

	public void uncheckItem(UUID itemId, UUID callerId) {
		packingItemRepository.findById(itemId)
				.orElseThrow(() ->
						new ResourceNotFoundException("持ち物が見つかりません"));

		if (!packingItemCheckRepository.existsByPackingItemIdAndUserId(itemId, callerId)) {
			throw new BadRequestException("この持ち物はチェックしていません");
		}

		packingItemCheckRepository.deleteByPackingItemIdAndUserId(itemId, callerId);
	}
}
