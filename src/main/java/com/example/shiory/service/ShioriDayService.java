package com.example.shiory.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.shiory.dto.ShioriDayUpdateRequest;
import com.example.shiory.entity.Photo;
import com.example.shiory.entity.Shiori;
import com.example.shiory.entity.ShioriDay;
import com.example.shiory.entity.ShioriMember;
import com.example.shiory.exception.BadRequestException;
import com.example.shiory.exception.ForbiddenException;
import com.example.shiory.exception.ResourceNotFoundException;
import com.example.shiory.repository.PhotoRepository;
import com.example.shiory.repository.ShioriDayRepository;
import com.example.shiory.repository.ShioriMemberRepository;
import com.example.shiory.repository.ShioriRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShioriDayService {

	private final ShioriDayRepository shioriDayRepository;
	private final ShioriRepository shioriRepository;
	private final ShioriMemberRepository shioriMemberRepository;
	private final PhotoRepository photoRepository;

	@Transactional
	public void updateDay(UUID dayId, UUID callerId, ShioriDayUpdateRequest request) {

		ShioriDay day = shioriDayRepository.findById(dayId)
				.orElseThrow(() -> new ResourceNotFoundException("日次ページが見つかりません"));

		Shiori shiori = shioriRepository.findById(day.getShioriId())
				.orElseThrow(() -> new ResourceNotFoundException("しおりが見つかりません"));

		ShioriMember member = shioriMemberRepository
				.findByShioriIdAndUserId(shiori.getId(), callerId)
				.orElseThrow(() -> new ForbiddenException("このしおりのメンバーではありません"));

		if (!"active".equals(member.getStatus())) {
			throw new ForbiddenException("このしおりのメンバーではありません");
		}

		boolean isOwner = shiori.getOwnerId().equals(callerId);

		if (!shiori.isEditable() && !isOwner) {
			throw new ForbiddenException("現在このしおりは編集が許可されていません");
		}

		if (request.isTitlePresent()) {
			day.setTitle(request.getTitle());
		}

		if (request.isNotesPresent()) {
			day.setNotes(request.getNotes());
		}

		if (request.isEstimatedCostPresent()) {
			day.setEstimatedCost(request.getEstimatedCost());
		}

		if (request.isRepresentativePhotoIdPresent()) {

			UUID photoId = request.getRepresentativePhotoId();

			if (photoId != null) {

				Photo photo = photoRepository.findById(photoId)
						.orElseThrow(() -> new ResourceNotFoundException("写真が見つかりません"));

				if (!photo.getDayId().equals(dayId)) {
					throw new BadRequestException("代表写真はこの日に投稿された写真から選んでください");
				}
			}

			day.setRepresentativePhotoId(photoId);
		}

		shioriDayRepository.save(day);
	}
}
