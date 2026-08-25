package com.example.shiory.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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
public class PhotoService {

	private final PhotoRepository photoRepository;
	private final ShioriDayRepository shioriDayRepository;
	private final ShioriRepository shioriRepository;
	private final ShioriMemberRepository shioriMemberRepository;
	private final SupabaseStorageService storageService;

	public Photo uploadPhoto(UUID dayId, UUID callerId, MultipartFile file) {

		ShioriDay day = shioriDayRepository.findById(dayId)
				.orElseThrow(() -> new ResourceNotFoundException("日次ページが見つかりません"));

		Shiori shiori = shioriRepository.findById(day.getShioriId())
				.orElseThrow(() -> new ResourceNotFoundException("しおりが見つかりません"));

		requireActiveMember(shiori, callerId);

		if (file == null || file.isEmpty()) {
			throw new BadRequestException("写真ファイルが空です");
		}

		String path = shiori.getId() + "/" + dayId + "/" + callerId + extractExtension(file.getOriginalFilename());
		String imagePath = storageService.upload(path, file);

		Photo photo = photoRepository
				.findByDayIdAndUserId(dayId, callerId)
				.orElseGet(() -> {
					Photo p = new Photo();
					p.setShioriId(shiori.getId());
					p.setDayId(dayId);
					p.setUserId(callerId);
					return p;
				});

		photo.setImagePath(imagePath);
		photo.setDeleted(false);

		return photoRepository.save(photo);
	}

	public void deletePhoto(UUID dayId, UUID callerId) {

		ShioriDay day = shioriDayRepository.findById(dayId)
				.orElseThrow(() -> new ResourceNotFoundException("日次ページが見つかりません"));

		Shiori shiori = shioriRepository.findById(day.getShioriId())
				.orElseThrow(() -> new ResourceNotFoundException("しおりが見つかりません"));

		requireActiveMember(shiori, callerId);

		Photo photo = photoRepository
				.findByDayIdAndUserId(dayId, callerId)
				.orElseThrow(() -> new ResourceNotFoundException("写真が見つかりません"));

		photo.setDeleted(true);

		photoRepository.save(photo);
	}

	private void requireActiveMember(Shiori shiori, UUID callerId) {

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
	}

	private String extractExtension(String filename) {

		if (filename == null || !filename.contains(".")) {
			return "";
		}

		return filename.substring(filename.lastIndexOf('.'));
	}
}
