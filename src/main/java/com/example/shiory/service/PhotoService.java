package com.example.shiory.service;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.shiory.dto.PhotoResponse;
import com.example.shiory.entity.Photo;
import com.example.shiory.entity.Shiori;
import com.example.shiory.entity.ShioriDay;
import com.example.shiory.entity.ShioriMember;
import com.example.shiory.exception.BadRequestException;
import com.example.shiory.exception.ForbiddenException;
import com.example.shiory.exception.ResourceNotFoundException;
import com.example.shiory.repository.PhotoLikeRepository;
import com.example.shiory.repository.PhotoRepository;
import com.example.shiory.repository.ShioriDayRepository;
import com.example.shiory.repository.ShioriMemberRepository;
import com.example.shiory.repository.ShioriRepository;

@Service
public class PhotoService {

	private final PhotoRepository photoRepository;
	private final ShioriDayRepository shioriDayRepository;
	private final ShioriRepository shioriRepository;
	private final ShioriMemberRepository shioriMemberRepository;
	private final PhotoLikeRepository photoLikeRepository;
	private final SupabaseStorageService storageService;
	private final String supabaseUrl;
	private final String bucket;

	public PhotoService(
			PhotoRepository photoRepository,
			ShioriDayRepository shioriDayRepository,
			ShioriRepository shioriRepository,
			ShioriMemberRepository shioriMemberRepository,
			PhotoLikeRepository photoLikeRepository,
			SupabaseStorageService storageService,
			@Value("${supabase.storage.url}") String supabaseUrl,
			@Value("${supabase.storage.bucket}") String bucket) {

		this.photoRepository = photoRepository;
		this.shioriDayRepository = shioriDayRepository;
		this.shioriRepository = shioriRepository;
		this.shioriMemberRepository = shioriMemberRepository;
		this.photoLikeRepository = photoLikeRepository;
		this.storageService = storageService;
		this.supabaseUrl = supabaseUrl;
		this.bucket = bucket;
	}

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

	@Transactional(readOnly = true)
	public List<PhotoResponse> getPhotos(UUID shioriId, UUID callerId) {

		shioriRepository.findById(shioriId)
				.orElseThrow(() -> new ResourceNotFoundException("しおりが見つかりません"));

		ShioriMember member = shioriMemberRepository
				.findByShioriIdAndUserId(shioriId, callerId)
				.orElseThrow(() -> new ForbiddenException("このしおりのメンバーではありません"));

		if (!"active".equals(member.getStatus())) {
			throw new ForbiddenException("このしおりのメンバーではありません");
		}

		return photoRepository.findByShioriIdAndDeletedFalseOrderByCreatedAtAsc(shioriId)
				.stream()
				.map(photo -> new PhotoResponse(
						photo.getId(),
						photo.getDayId(),
						photo.getUserId(),
						supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + photo.getImagePath(),
						photoLikeRepository.countByPhotoId(photo.getId()),
						photo.getCreatedAt()))
				.toList();
	}

	@Transactional(readOnly = true)
	public PhotoResponse getPhoto(UUID photoId, UUID callerId) {

		Photo photo = photoRepository.findById(photoId)
				.filter(p -> !p.isDeleted())
				.orElseThrow(() -> new ResourceNotFoundException("写真が見つかりません"));

		ShioriMember member = shioriMemberRepository
				.findByShioriIdAndUserId(photo.getShioriId(), callerId)
				.orElseThrow(() -> new ForbiddenException("このしおりのメンバーではありません"));

		if (!"active".equals(member.getStatus())) {
			throw new ForbiddenException("このしおりのメンバーではありません");
		}

		return new PhotoResponse(
				photo.getId(),
				photo.getDayId(),
				photo.getUserId(),
				supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + photo.getImagePath(),
				photoLikeRepository.countByPhotoId(photo.getId()),
				photo.getCreatedAt());
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
