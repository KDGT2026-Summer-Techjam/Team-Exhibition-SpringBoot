package com.example.shiory.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.shiory.dto.RoadmapItemCreateRequest;
import com.example.shiory.entity.RoadmapItem;
import com.example.shiory.entity.Shiori;
import com.example.shiory.entity.ShioriDay;
import com.example.shiory.entity.ShioriMember;
import com.example.shiory.repository.RoadmapItemRepository;
import com.example.shiory.repository.ShioriDayRepository;
import com.example.shiory.repository.ShioriMemberRepository;
import com.example.shiory.repository.ShioriRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RoadmapItemService {

	private final RoadmapItemRepository roadmapItemRepository;
	private final ShioriDayRepository shioriDayRepository;
	private final ShioriRepository shioriRepository;
	private final ShioriMemberRepository shioriMemberRepository;

	public RoadmapItem createRoadmapItem(UUID dayId, UUID callerId, RoadmapItemCreateRequest request) {

		ShioriDay day = shioriDayRepository.findById(dayId)
				.orElseThrow(() -> new IllegalArgumentException("日次ページが見つかりません"));

		Shiori shiori = shioriRepository.findById(day.getShioriId())
				.orElseThrow(() -> new IllegalArgumentException("しおりが見つかりません"));

		ShioriMember member = shioriMemberRepository
				.findByShioriIdAndUserId(shiori.getId(), callerId)
				.orElseThrow(() -> new IllegalArgumentException("このしおりのメンバーではありません"));

		if (!"active".equals(member.getStatus())) {
			throw new IllegalArgumentException("このしおりのメンバーではありません");
		}

		boolean isOwner = shiori.getOwnerId().equals(callerId);

		if (!shiori.isEditable() && !isOwner) {
			throw new IllegalArgumentException("現在このしおりは編集が許可されていません");
		}

		if (request.getEndsAt().isBefore(request.getStartsAt())) {
			throw new IllegalArgumentException("終了時刻は開始時刻以降にしてください");
		}

		RoadmapItem item = new RoadmapItem();

		item.setDayId(dayId);
		item.setStartsAt(request.getStartsAt());
		item.setEndsAt(request.getEndsAt());
		item.setTitle(request.getTitle());
		item.setAmount(request.getAmount());
		item.setSortOrder(request.getSortOrder());

		return roadmapItemRepository.save(item);
	}
}
