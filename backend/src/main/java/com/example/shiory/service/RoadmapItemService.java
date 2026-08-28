package com.example.shiory.service;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.shiory.constant.CommentTargetType;
import com.example.shiory.dto.RoadmapItemCreateRequest;
import com.example.shiory.dto.RoadmapItemResponse;
import com.example.shiory.dto.RoadmapItemUpdateRequest;
import com.example.shiory.entity.RoadmapItem;
import com.example.shiory.entity.Shiori;
import com.example.shiory.entity.ShioriDay;
import com.example.shiory.exception.BadRequestException;
import com.example.shiory.exception.ResourceNotFoundException;
import com.example.shiory.repository.CommentRepository;
import com.example.shiory.repository.RoadmapItemRepository;
import com.example.shiory.repository.ShioriDayRepository;
import com.example.shiory.repository.ShioriRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RoadmapItemService {

	private final RoadmapItemRepository roadmapItemRepository;
	private final ShioriDayRepository shioriDayRepository;
	private final ShioriRepository shioriRepository;
	private final CommentRepository commentRepository;
	private final ShioriAccessHelper accessHelper;

	public RoadmapItem createRoadmapItem(UUID dayId, UUID callerId, RoadmapItemCreateRequest request) {

		ShioriDay day = shioriDayRepository.findById(dayId)
				.orElseThrow(() -> new ResourceNotFoundException("日次ページが見つかりません"));

		Shiori shiori = shioriRepository.findById(day.getShioriId())
				.orElseThrow(() -> new ResourceNotFoundException("しおりが見つかりません"));

		accessHelper.requireDayEdit(shiori, day, callerId);

		if (request.getEndsAt() != null && request.getEndsAt().isBefore(request.getStartsAt())) {
			throw new BadRequestException("終了時刻は開始時刻以降にしてください");
		}

		RoadmapItem item = new RoadmapItem();

		item.setDayId(dayId);
		item.setStartsAt(request.getStartsAt());
		item.setEndsAt(request.getEndsAt());
		item.setTitle(request.getTitle() != null ? request.getTitle() : "");
		item.setAmount(request.getAmount());
		item.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);

		return roadmapItemRepository.save(item);
	}

	public void updateRoadmapItem(UUID itemId, UUID callerId, RoadmapItemUpdateRequest request) {

		RoadmapItem item = roadmapItemRepository.findById(itemId)
				.orElseThrow(() -> new ResourceNotFoundException("予定が見つかりません"));

		ShioriDay day = shioriDayRepository.findById(item.getDayId())
				.orElseThrow(() -> new ResourceNotFoundException("日次ページが見つかりません"));

		Shiori shiori = shioriRepository.findById(day.getShioriId())
				.orElseThrow(() -> new ResourceNotFoundException("しおりが見つかりません"));

		accessHelper.requireDayEdit(shiori, day, callerId);

		LocalTime startsAt = request.isStartsAtPresent() ? request.getStartsAt() : item.getStartsAt();
		LocalTime endsAt = request.isEndsAtPresent() ? request.getEndsAt() : item.getEndsAt();

		if (startsAt == null) {
			throw new BadRequestException("開始時刻をnullにはできません");
		}

		if (endsAt != null && endsAt.isBefore(startsAt)) {
			throw new BadRequestException("終了時刻は開始時刻以降にしてください");
		}

		item.setStartsAt(startsAt);
		item.setEndsAt(endsAt);

		if (request.isTitlePresent()) {
			item.setTitle(request.getTitle() != null ? request.getTitle() : "");
		}

		if (request.isAmountPresent()) {
			item.setAmount(request.getAmount());
		}

		if (request.isSortOrderPresent()) {
			item.setSortOrder(request.getSortOrder());
		}

		roadmapItemRepository.save(item);
	}

	@Transactional
	public void deleteRoadmapItem(UUID itemId, UUID callerId) {

		RoadmapItem item = roadmapItemRepository.findById(itemId)
				.orElseThrow(() -> new ResourceNotFoundException("予定が見つかりません"));

		ShioriDay day = shioriDayRepository.findById(item.getDayId())
				.orElseThrow(() -> new ResourceNotFoundException("日次ページが見つかりません"));

		Shiori shiori = shioriRepository.findById(day.getShioriId())
				.orElseThrow(() -> new ResourceNotFoundException("しおりが見つかりません"));

		accessHelper.requireDayEdit(shiori, day, callerId);

		commentRepository.deleteByTargetTypeAndTargetId(
				CommentTargetType.ROADMAP_ITEM,
				itemId);

		roadmapItemRepository.delete(item);
	}

	@Transactional(readOnly = true)
	public List<RoadmapItemResponse> getRoadmapItems(UUID dayId, UUID callerId) {

		ShioriDay day = shioriDayRepository.findById(dayId)
				.orElseThrow(() -> new ResourceNotFoundException("日次ページが見つかりません"));

		accessHelper.requireActiveMember(day.getShioriId(), callerId);

		return roadmapItemRepository.findByDayIdOrderByStartsAtAscSortOrderAsc(dayId)
				.stream()
				.map(this::toResponse)
				.toList();
	}

	@Transactional(readOnly = true)
	public RoadmapItemResponse getRoadmapItem(UUID itemId, UUID callerId) {

		RoadmapItem item = roadmapItemRepository.findById(itemId)
				.orElseThrow(() -> new ResourceNotFoundException("予定が見つかりません"));

		ShioriDay day = shioriDayRepository.findById(item.getDayId())
				.orElseThrow(() -> new ResourceNotFoundException("日次ページが見つかりません"));

		accessHelper.requireActiveMember(day.getShioriId(), callerId);

		return toResponse(item);
	}

	private RoadmapItemResponse toResponse(RoadmapItem item) {

		return new RoadmapItemResponse(
				item.getId(),
				item.getStartsAt(),
				item.getEndsAt(),
				item.getTitle(),
				item.getAmount(),
				item.getSortOrder());
	}
}
