package com.example.shiory.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.shiory.constant.CommentTargetType;
import com.example.shiory.dto.ShioriDayInsertRequest;
import com.example.shiory.entity.Shiori;
import com.example.shiory.entity.ShioriDay;
import com.example.shiory.entity.Photo;
import com.example.shiory.entity.RoadmapItem;
import com.example.shiory.exception.BadRequestException;
import com.example.shiory.exception.ForbiddenException;
import com.example.shiory.exception.ResourceNotFoundException;
import com.example.shiory.repository.CommentRepository;
import com.example.shiory.repository.ShioriDayRepository;
import com.example.shiory.repository.ShioriRepository;
import com.example.shiory.repository.PhotoRepository;
import com.example.shiory.repository.PhotoLikeRepository;
import com.example.shiory.repository.RoadmapItemRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShioriDayService {
	
	private final ShioriRepository shioriRepository;
	private final ShioriDayRepository shioriDayRepository;
	private final RoadmapItemRepository roadmapItemRepository;
	private final PhotoRepository photoRepository;
	private final PhotoLikeRepository photoLikeRepository;
	private final CommentRepository commentRepository;

	@Transactional
	public void insertDay(
			UUID shioriId,
			UUID callerId,
			ShioriDayInsertRequest request) {

		Shiori shiori = shioriRepository.findById(shioriId)
				.orElseThrow(() ->
						new ResourceNotFoundException("しおりが見つかりません"));

		if (!shiori.getOwnerId().equals(callerId)) {
			throw new ForbiddenException("日次ページの挿入は作成者のみ行えます");
		}

		ShioriDay lastDay = shioriDayRepository
				.findTopByShioriIdOrderByDayNumberDesc(shioriId)
				.orElseThrow(() ->
						new BadRequestException("日次ページが存在しません"));

		int maxDayNumber = lastDay.getDayNumber();
		int afterDayNumber = request.getAfterDayNumber();

		if (afterDayNumber > maxDayNumber) {
			throw new BadRequestException("挿入位置が現在の日数を超えています");
		}

		List<ShioriDay> daysToShift = shioriDayRepository
					.findByShioriIdAndDayNumberGreaterThanOrderByDayNumberDesc(
							shioriId,
							afterDayNumber);

		for (ShioriDay day : daysToShift) {

			day.setDayNumber(day.getDayNumber() + 1);
			day.setTripDate(day.getTripDate().plusDays(1));

			shioriDayRepository.saveAndFlush(day);
		}

		ShioriDay newDay = new ShioriDay();

		newDay.setShioriId(shioriId);
		newDay.setDayNumber(afterDayNumber + 1);

		LocalDate newTripDate =
				shiori.getStartDate().plusDays(afterDayNumber);

		newDay.setTripDate(newTripDate);

		shioriDayRepository.saveAndFlush(newDay);

		shiori.setEndDate(
				shiori.getEndDate().plusDays(1));

		shioriRepository.save(shiori);
	}

	@Transactional
	public void deleteDay(
			UUID dayId,
			UUID callerId) {

		ShioriDay day = shioriDayRepository.findById(dayId)
				.orElseThrow(() ->
						new ResourceNotFoundException("日次ページが見つかりません"));

		Shiori shiori = shioriRepository.findById(day.getShioriId())
				.orElseThrow(() ->
						new ResourceNotFoundException("しおりが見つかりません"));

		if (!shiori.getOwnerId().equals(callerId)) {
			throw new ForbiddenException(
					"日次ページの削除は作成者のみ行えます");
		}

		int deletedDayNumber = day.getDayNumber();

		List<RoadmapItem> roadmapItems =
				roadmapItemRepository.findByDayId(dayId);

		for (RoadmapItem roadmapItem : roadmapItems) {
			commentRepository.deleteByTargetTypeAndTargetId(
					CommentTargetType.ROADMAP_ITEM,
					roadmapItem.getId());
		}

		List<Photo> photos =
				photoRepository.findByDayId(dayId);

		for (Photo photo : photos) {
			commentRepository.deleteByTargetTypeAndTargetId(
					CommentTargetType.PHOTO,
					photo.getId());

			photoLikeRepository.deleteByPhotoId(
					photo.getId());
		}

		photoLikeRepository.flush();

		commentRepository.deleteByTargetTypeAndTargetId(
				CommentTargetType.SHIORI_DAY,
				dayId);

		day.setRepresentativePhotoId(null);
		shioriDayRepository.saveAndFlush(day);

		roadmapItemRepository.deleteAll(roadmapItems);
		roadmapItemRepository.flush();

		photoRepository.deleteAll(photos);
		photoRepository.flush();

		shioriDayRepository.delete(day);
		shioriDayRepository.flush();

		List<ShioriDay> daysToShift =
				shioriDayRepository
						.findByShioriIdAndDayNumberGreaterThanOrderByDayNumberAsc(
								shiori.getId(),
								deletedDayNumber);

		for (ShioriDay dayToShift : daysToShift) {

			dayToShift.setDayNumber(
					dayToShift.getDayNumber() - 1);

			dayToShift.setTripDate(
					dayToShift.getTripDate().minusDays(1));

			shioriDayRepository.saveAndFlush(dayToShift);
		}

		shiori.setEndDate(
				shiori.getEndDate().minusDays(1));

		shioriRepository.save(shiori);
	}
}
