package com.example.shiory.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.shiory.dto.PackingItemCreateRequest;
import com.example.shiory.dto.PackingItemContributionResponse;
import com.example.shiory.dto.PackingItemResponse;
import com.example.shiory.dto.PackingItemUpdateRequest;
import com.example.shiory.entity.PackingItem;
import com.example.shiory.entity.PackingItemContribution;
import com.example.shiory.entity.Shiori;
import com.example.shiory.entity.User;
import com.example.shiory.exception.BadRequestException;
import com.example.shiory.exception.ResourceNotFoundException;
import com.example.shiory.repository.PackingItemContributionRepository;
import com.example.shiory.repository.PackingItemRepository;
import com.example.shiory.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class PackingItemService {

	private static final int MAX_ITEMS_PER_SHIORI = 10;

	private final PackingItemRepository packingItemRepository;
	private final PackingItemContributionRepository contributionRepository;
	private final UserRepository userRepository;
	private final ShioriAccessHelper accessHelper;

	public PackingItemResponse createPackingItem(
			UUID shioriId,
			UUID callerId,
			PackingItemCreateRequest request) {

		Shiori shiori = accessHelper.requireActiveMemberWithShiori(shioriId, callerId);
		accessHelper.requireTravelPlanEdit(shiori, callerId);

		if (packingItemRepository.countByShioriId(shioriId) >= MAX_ITEMS_PER_SHIORI) {
			throw new BadRequestException("持ち物は10件まで登録できます");
		}

		PackingItem item = new PackingItem();

		item.setShioriId(shiori.getId());
		item.setName(request.getName());
		item.setRequiredCount(request.getRequiredCount());
		item.setSortOrder((int) packingItemRepository.countByShioriId(shioriId));

		return toResponse(packingItemRepository.save(item));
	}

	public List<PackingItemResponse> getPackingItems(UUID shioriId, UUID callerId) {

		accessHelper.requireActiveMember(shioriId, callerId);

		return packingItemRepository.findByShioriIdOrderBySortOrderAscCreatedAtAsc(shioriId)
				.stream()
				.map(this::toResponse)
				.toList();
	}

	public PackingItemResponse updatePackingItem(
			UUID itemId,
			UUID callerId,
			PackingItemUpdateRequest request) {

		PackingItem item = requireItem(itemId);
		Shiori shiori = accessHelper.requireActiveMemberWithShiori(item.getShioriId(), callerId);
		accessHelper.requireTravelPlanEdit(shiori, callerId);

		if (request.isNamePresent()) {
			item.setName(request.getName() != null ? request.getName() : "");
		}

		if (request.isRequiredCountPresent()) {

			if (request.getRequiredCount() == null || request.getRequiredCount() < 1) {
				throw new BadRequestException("必要数は1以上で指定してください");
			}

			int totalContributed = sumContributions(itemId);

			if (request.getRequiredCount() < totalContributed) {
				throw new BadRequestException("必要数は担当数量の合計以上にしてください");
			}

			item.setRequiredCount(request.getRequiredCount());
		}

		if (request.isSortOrderPresent() && request.getSortOrder() != null) {
			item.setSortOrder(request.getSortOrder());
		}

		return toResponse(packingItemRepository.save(item));
	}

	public void deletePackingItem(UUID itemId, UUID callerId) {

		PackingItem item = requireItem(itemId);
		Shiori shiori = accessHelper.requireActiveMemberWithShiori(item.getShioriId(), callerId);
		accessHelper.requireTravelPlanEdit(shiori, callerId);

		contributionRepository.deleteByPackingItemId(itemId);
		packingItemRepository.delete(item);
	}

	public PackingItemResponse contribute(UUID itemId, UUID callerId) {

		PackingItem item = requireItem(itemId);
		accessHelper.requireActiveMember(item.getShioriId(), callerId);

		var existing = contributionRepository.findByPackingItemIdAndUserId(itemId, callerId);
		int totalQuantity = sumContributions(itemId);

		if (existing.isEmpty()) {

			PackingItemContribution contribution = new PackingItemContribution();

			contribution.setPackingItemId(itemId);
			contribution.setUserId(callerId);
			contribution.setQuantity(1);

			contributionRepository.save(contribution);
		} else {

			PackingItemContribution contribution = existing.get();

			if (totalQuantity + 1 <= item.getRequiredCount()) {
				contribution.setQuantity(contribution.getQuantity() + 1);
				contributionRepository.save(contribution);
			} else {
				contributionRepository.delete(contribution);
			}
		}

		return toResponse(item);
	}

	private PackingItem requireItem(UUID itemId) {

		return packingItemRepository.findById(itemId)
				.orElseThrow(() -> new ResourceNotFoundException("持ち物が見つかりません"));
	}

	private int sumContributions(UUID itemId) {

		return contributionRepository.findByPackingItemIdOrderByCreatedAtAsc(itemId)
				.stream()
				.mapToInt(PackingItemContribution::getQuantity)
				.sum();
	}

	private PackingItemResponse toResponse(PackingItem item) {

		List<PackingItemContributionResponse> contributions =
				contributionRepository.findByPackingItemIdOrderByCreatedAtAsc(item.getId())
						.stream()
						.map(contribution -> {

							User user = userRepository.findById(contribution.getUserId())
									.orElseThrow(() ->
											new ResourceNotFoundException("ユーザーが見つかりません"));

							return new PackingItemContributionResponse(
									contribution.getUserId(),
									user.getUsername(),
									contribution.getQuantity());
						})
						.toList();

		return new PackingItemResponse(
				item.getId(),
				item.getName(),
				item.getRequiredCount(),
				contributions);
	}
}
