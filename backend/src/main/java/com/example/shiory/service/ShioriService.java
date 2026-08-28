package com.example.shiory.service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.shiory.constant.CommentTargetType;
import com.example.shiory.constant.ShioriMemberStatus;
import com.example.shiory.dto.ShioriCreateRequest;
import com.example.shiory.dto.ShioriDeleteRequest;
import com.example.shiory.dto.ShioriDetailResponse;
import com.example.shiory.dto.ShioriPagePermissionsUpdateRequest;
import com.example.shiory.dto.ShioriPeriodUpdateRequest;
import com.example.shiory.dto.ShioriSummaryResponse;
import com.example.shiory.dto.ShioriUpdateRequest;
import com.example.shiory.entity.Photo;
import com.example.shiory.entity.RoadmapItem;
import com.example.shiory.entity.Shiori;
import com.example.shiory.entity.ShioriDay;
import com.example.shiory.entity.ShioriMember;
import com.example.shiory.exception.BadRequestException;
import com.example.shiory.exception.ForbiddenException;
import com.example.shiory.exception.ResourceNotFoundException;
import com.example.shiory.repository.CommentRepository;
import com.example.shiory.repository.PhotoLikeRepository;
import com.example.shiory.repository.PhotoRepository;
import com.example.shiory.repository.RoadmapItemRepository;
import com.example.shiory.repository.ShioriDayRepository;
import com.example.shiory.repository.ShioriMemberRepository;
import com.example.shiory.repository.ShioriRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShioriService {

	private final ShioriRepository shioriRepository;
	private final ShioriMemberRepository shioriMemberRepository;
	private final ShioriDayRepository shioriDayRepository;
	private final RoadmapItemRepository roadmapItemRepository;
	private final PhotoRepository photoRepository;
	private final PhotoLikeRepository photoLikeRepository;
	private final CommentRepository commentRepository;
	private final PasswordEncoder passwordEncoder;
	private final ShioriAccessHelper accessHelper;

	@Transactional
	public Shiori createShiori(ShioriCreateRequest request, UUID ownerId) {

		LocalDate startDate = request.getStartDate();
		LocalDate endDate = request.getEndDate();

		if ((startDate == null) != (endDate == null)) {
			throw new BadRequestException("開始日と終了日は両方指定するか、両方省略してください");
		}

		if (startDate != null && endDate.isBefore(startDate)) {
			throw new BadRequestException("終了日は開始日以降にしてください");
		}

		Shiori shiori = new Shiori();

		shiori.setOwnerId(ownerId);
		shiori.setTitle(request.getTitle());
		shiori.setDescription(request.getDescription());
		shiori.setStartDate(startDate);
		shiori.setEndDate(endDate);
		shiori.setPasswordHash(passwordEncoder.encode(request.getPassword()));

		Shiori savedShiori = shioriRepository.save(shiori);

		ShioriMember ownerMember = new ShioriMember();

		ownerMember.setShioriId(savedShiori.getId());
		ownerMember.setUserId(ownerId);
		ownerMember.setRole("owner");
		ownerMember.setStatus(ShioriMemberStatus.ACTIVE);
		ownerMember.setJoinedAt(OffsetDateTime.now());

		shioriMemberRepository.save(ownerMember);

		if (startDate != null) {
			createDaysForRange(savedShiori.getId(), startDate, endDate);
		}

		return savedShiori;
	}

	@Transactional
	public void updatePeriod(UUID shioriId, UUID callerId, ShioriPeriodUpdateRequest request) {

		Shiori shiori = accessHelper.requireOwner(shioriId, callerId);

		LocalDate startDate = request.getStartDate();
		LocalDate endDate = request.getEndDate();

		if (startDate == null) {
			startDate = endDate;
		}

		if (startDate == null && endDate == null) {
			throw new BadRequestException("開始日と終了日を指定してください");
		}

		if (endDate.isBefore(startDate)) {
			throw new BadRequestException("終了日は開始日以降にしてください");
		}

		List<ShioriDay> existingDays =
				shioriDayRepository.findByShioriIdOrderByDayNumberAsc(shioriId);

		if (existingDays.isEmpty()) {
			shiori.setStartDate(startDate);
			shiori.setEndDate(endDate);
			shioriRepository.save(shiori);
			createDaysForRange(shioriId, startDate, endDate);
			return;
		}

		Set<LocalDate> targetDates = new HashSet<>();

		for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
			targetDates.add(date);
		}

		for (ShioriDay day : existingDays) {
			if (!targetDates.contains(day.getTripDate())) {
				deleteDayWithChildren(day);
			}
		}

		List<ShioriDay> remainingDays =
				shioriDayRepository.findByShioriIdOrderByTripDateAsc(shioriId);

		Set<LocalDate> existingDates = new HashSet<>();

		for (ShioriDay day : remainingDays) {
			existingDates.add(day.getTripDate());
		}

		for (LocalDate date : targetDates) {
			if (!existingDates.contains(date)) {
				ShioriDay newDay = new ShioriDay();

				newDay.setShioriId(shioriId);
				newDay.setTripDate(date);
				newDay.setEditable(true);
				newDay.setCommentOpen(true);

				shioriDayRepository.save(newDay);
			}
		}

		List<ShioriDay> allDays =
				shioriDayRepository.findByShioriIdOrderByTripDateAsc(shioriId);

		int dayNumber = 1;

		for (ShioriDay day : allDays) {
			day.setDayNumber(dayNumber++);
			shioriDayRepository.save(day);
		}

		shiori.setStartDate(startDate);
		shiori.setEndDate(endDate);
		shioriRepository.save(shiori);
	}

	@Transactional
	public void updateShiori(UUID shioriId, UUID callerId, ShioriUpdateRequest request) {

		Shiori shiori = accessHelper.requireExistingShiori(shioriId);
		accessHelper.requireActiveMember(shioriId, callerId);

		boolean isOwner = accessHelper.isOwner(shiori, callerId);

		if (request.isTitlePresent()
				|| request.isDescriptionPresent()
				|| request.isPromisesPresent()) {

			if (!accessHelper.canEditTravelPlan(shiori, callerId)) {
				throw new ForbiddenException("現在このしおりは編集が許可されていません");
			}
		}

		if (request.isPasswordPresent()) {

			if (!isOwner) {
				throw new ForbiddenException("しおりパスワードの変更は作成者のみ行えます");
			}

			if (request.getPassword() != null && !request.getPassword().isBlank()) {

				if (request.getPassword().length() < 10) {
					throw new BadRequestException("パスワードは10文字以上で入力してください");
				}

				shiori.setPasswordHash(passwordEncoder.encode(request.getPassword()));
			}
		}

		if (request.isTitlePresent()) {

			if (request.getTitle() == null || request.getTitle().isBlank()) {
				throw new BadRequestException("タイトルを入力してください");
			}

			shiori.setTitle(request.getTitle());
		}

		if (request.isDescriptionPresent()) {
			shiori.setDescription(request.getDescription());
		}

		if (request.isPromisesPresent()) {
			shiori.setPromises(request.getPromises());
		}

		shioriRepository.save(shiori);
	}

	@Transactional
	public void updatePagePermissions(
			UUID shioriId,
			UUID callerId,
			ShioriPagePermissionsUpdateRequest request) {

		Shiori shiori = accessHelper.requireOwner(shioriId, callerId);

		if (request.getEditable() != null) {
			shiori.setEditable(request.getEditable());
		}

		if (request.getCommentOpen() != null) {
			shiori.setCommentOpen(request.getCommentOpen());
		}

		shioriRepository.save(shiori);

		if (request.getDays() != null) {

			for (ShioriPagePermissionsUpdateRequest.DayPermissionUpdate dayUpdate : request.getDays()) {

				if (dayUpdate.getDayId() == null) {
					throw new BadRequestException("日次ページIDを指定してください");
				}

				ShioriDay day = shioriDayRepository.findById(dayUpdate.getDayId())
						.orElseThrow(() -> new ResourceNotFoundException("日次ページが見つかりません"));

				if (!day.getShioriId().equals(shioriId)) {
					throw new BadRequestException("指定された日次ページはこのしおりに属していません");
				}

				if (dayUpdate.getEditable() != null) {
					day.setEditable(dayUpdate.getEditable());
				}

				if (dayUpdate.getCommentOpen() != null) {
					day.setCommentOpen(dayUpdate.getCommentOpen());
				}

				shioriDayRepository.save(day);
			}
		}
	}

	@Transactional
	public void deleteShiori(UUID shioriId, UUID callerId, ShioriDeleteRequest request) {

		Shiori shiori = accessHelper.requireOwner(shioriId, callerId);

		if (!passwordEncoder.matches(request.getPassword(), shiori.getPasswordHash())) {
			throw new BadRequestException("パスワードが一致しません");
		}

		if (shioriMemberRepository.existsByShioriIdAndStatusAndUserIdNot(
				shioriId,
				ShioriMemberStatus.ACTIVE,
				callerId)) {

			throw new BadRequestException("退出していないメンバーがいるため削除できません");
		}

		shiori.setDeletedAt(OffsetDateTime.now());
		shioriRepository.save(shiori);
	}

	@Transactional(readOnly = true)
	public List<ShioriSummaryResponse> getShioriList(UUID callerId) {

		List<UUID> shioriIds = shioriMemberRepository
				.findByUserIdAndStatus(callerId, ShioriMemberStatus.ACTIVE)
				.stream()
				.map(ShioriMember::getShioriId)
				.toList();

		return shioriRepository
				.findByIdInAndDeletedAtIsNullOrderByCreatedAtAsc(shioriIds)
				.stream()
				.map(shiori -> new ShioriSummaryResponse(
						shiori.getId(),
						shiori.getTitle(),
						shiori.getStartDate(),
						shiori.getEndDate(),
						shiori.getOwnerId(),
						shiori.getCreatedAt(),
						shiori.getDescription(),
						shiori.getOwnerId().equals(callerId)))
				.toList();
	}

	@Transactional(readOnly = true)
	public ShioriDetailResponse getShioriDetail(UUID shioriId, UUID callerId) {

		Shiori shiori = accessHelper.requireActiveMemberWithShiori(shioriId, callerId);

		return new ShioriDetailResponse(
				shiori.getId(),
				shiori.getOwnerId(),
				shiori.getTitle(),
				shiori.getDescription(),
				shiori.getStartDate(),
				shiori.getEndDate(),
				shiori.isEditable(),
				shiori.isCommentOpen(),
				shiori.getPromises(),
				shiori.getCreatedAt(),
				shiori.getUpdatedAt(),
				shiori.getOwnerId().equals(callerId));
	}

	private void createDaysForRange(UUID shioriId, LocalDate startDate, LocalDate endDate) {

		List<ShioriDay> days = new ArrayList<>();
		int dayNumber = 1;

		for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {

			ShioriDay day = new ShioriDay();

			day.setShioriId(shioriId);
			day.setTripDate(date);
			day.setDayNumber(dayNumber);
			day.setEditable(true);
			day.setCommentOpen(true);

			days.add(day);
			dayNumber++;
		}

		shioriDayRepository.saveAll(days);
	}

	private void deleteDayWithChildren(ShioriDay day) {

		UUID dayId = day.getId();

		List<RoadmapItem> roadmapItems = roadmapItemRepository.findByDayId(dayId);

		for (RoadmapItem roadmapItem : roadmapItems) {
			commentRepository.deleteByTargetTypeAndTargetId(
					CommentTargetType.ROADMAP_ITEM,
					roadmapItem.getId());
		}

		List<Photo> photos = photoRepository.findByDayId(dayId);

		for (Photo photo : photos) {
			commentRepository.deleteByTargetTypeAndTargetId(CommentTargetType.PHOTO, photo.getId());
			photoLikeRepository.deleteByPhotoId(photo.getId());
		}

		photoLikeRepository.flush();
		commentRepository.deleteByTargetTypeAndTargetId(CommentTargetType.SHIORI_DAY, dayId);

		day.setRepresentativePhotoId(null);
		shioriDayRepository.saveAndFlush(day);

		roadmapItemRepository.deleteAll(roadmapItems);
		roadmapItemRepository.flush();

		photoRepository.deleteAll(photos);
		photoRepository.flush();

		shioriDayRepository.delete(day);
		shioriDayRepository.flush();
	}
}
