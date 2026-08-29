package com.example.shiory.service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.shiory.dto.PhotoResponse;
import com.example.shiory.entity.Photo;
import com.example.shiory.entity.Shiori;
import com.example.shiory.entity.ShioriDay;
import com.example.shiory.entity.User;
import com.example.shiory.exception.BadRequestException;
import com.example.shiory.exception.ForbiddenException;
import com.example.shiory.exception.ResourceNotFoundException;
import com.example.shiory.repository.PhotoLikeRepository;
import com.example.shiory.repository.PhotoRepository;
import com.example.shiory.repository.ShioriDayRepository;
import com.example.shiory.repository.ShioriRepository;
import com.example.shiory.repository.UserRepository;

@Service
public class PhotoService {

	private final PhotoRepository photoRepository;
	private final ShioriDayRepository shioriDayRepository;
	private final ShioriRepository shioriRepository;
	private final UserRepository userRepository;
	private final PhotoLikeRepository photoLikeRepository;
	private final SupabaseStorageService storageService;
	private final ShioriAccessHelper accessHelper;
	private final String supabaseUrl;
	private final String bucket;

	public PhotoService(
			PhotoRepository photoRepository,
			ShioriDayRepository shioriDayRepository,
			ShioriRepository shioriRepository,
			UserRepository userRepository,
			PhotoLikeRepository photoLikeRepository,
			SupabaseStorageService storageService,
			ShioriAccessHelper accessHelper,
			@Value("${supabase.storage.url}") String supabaseUrl,
			@Value("${supabase.storage.bucket}") String bucket) {

		this.photoRepository = photoRepository;
		this.shioriDayRepository = shioriDayRepository;
		this.shioriRepository = shioriRepository;
		this.userRepository = userRepository;
		this.photoLikeRepository = photoLikeRepository;
		this.storageService = storageService;
		this.accessHelper = accessHelper;
		this.supabaseUrl = supabaseUrl;
		this.bucket = bucket;
	}

	private static final long MAX_PHOTOS_PER_DAY_PER_USER = 30;

	public Photo uploadPhoto(UUID dayId, UUID callerId, MultipartFile file) {

		ShioriDay day = shioriDayRepository.findById(dayId)
				.orElseThrow(() -> new ResourceNotFoundException("日次ページが見つかりません"));

		Shiori shiori = accessHelper.requireActiveMemberWithShiori(day.getShioriId(), callerId);

		if (file == null || file.isEmpty()) {
			throw new BadRequestException("写真ファイルが空です");
		}

		if (photoRepository.countByDayIdAndUserIdAndDeletedFalse(dayId, callerId)
				>= MAX_PHOTOS_PER_DAY_PER_USER) {
			throw new BadRequestException("この日に登録できる写真は" + MAX_PHOTOS_PER_DAY_PER_USER + "枚までです");
		}

		String path = shiori.getId() + "/" + dayId + "/" + callerId + "/"
				+ UUID.randomUUID() + extractExtension(file.getOriginalFilename());
		String imagePath = storageService.upload(path, file);

		Photo photo = new Photo();
		photo.setShioriId(shiori.getId());
		photo.setDayId(dayId);
		photo.setUserId(callerId);
		photo.setImagePath(imagePath);
		photo.setDeleted(false);

		return photoRepository.save(photo);
	}

	public void deletePhoto(UUID photoId, UUID callerId) {

		Photo photo = photoRepository.findById(photoId)
				.orElseThrow(() -> new ResourceNotFoundException("写真が見つかりません"));

		requirePhotoOwnerOrShioriOwner(photo, callerId);

		photo.setDeleted(true);
		photoRepository.save(photo);
	}

	@Transactional(readOnly = true)
	public List<PhotoResponse> getPhotos(
			UUID shioriId,
			UUID callerId,
			Boolean includeDeleted) {

		accessHelper.requireActiveMember(shioriId, callerId);

		shioriRepository.findById(shioriId)
				.filter(s -> s.getDeletedAt() == null)
				.orElseThrow(() -> new ResourceNotFoundException("しおりが見つかりません"));

		Map<UUID, ShioriDay> dayById = shioriDayRepository.findByShioriIdOrderByDayNumberAsc(shioriId)
				.stream()
				.collect(Collectors.toMap(ShioriDay::getId, Function.identity()));

		List<Photo> photos = photoRepository.findByShioriIdOrderByCreatedAtAsc(shioriId);

		List<UUID> userIds = photos.stream()
				.map(Photo::getUserId)
				.distinct()
				.toList();

		Map<UUID, User> userById = userRepository.findAllById(userIds)
				.stream()
				.collect(Collectors.toMap(User::getId, Function.identity()));

		return photos
				.stream()
				.filter(photo -> includeDeleted == null || includeDeleted || !photo.isDeleted())
				.map(photo -> toResponse(photo, dayById, userById))
				.sorted(Comparator.comparing(PhotoResponse::getCreatedAt))
				.toList();
	}

	@Transactional(readOnly = true)
	public PhotoResponse getPhoto(UUID photoId, UUID callerId) {

		Photo photo = photoRepository.findById(photoId)
				.orElseThrow(() -> new ResourceNotFoundException("写真が見つかりません"));

		accessHelper.requireActiveMember(photo.getShioriId(), callerId);

		ShioriDay day = shioriDayRepository.findById(photo.getDayId())
				.orElseThrow(() -> new ResourceNotFoundException("日次ページが見つかりません"));

		User user = userRepository.findById(photo.getUserId())
				.orElseThrow(() -> new ResourceNotFoundException("ユーザーが見つかりません"));

		return new PhotoResponse(
				photo.getId(),
				photo.getDayId(),
				day.getDayNumber(),
				photo.getUserId(),
				user.getUsername(),
				buildImageUrl(photo.getImagePath()),
				photo.isDeleted(),
				photoLikeRepository.countByPhotoId(photo.getId()),
				photo.getCreatedAt());
	}

	private void requirePhotoOwnerOrShioriOwner(Photo photo, UUID callerId) {

		Shiori shiori = shioriRepository.findById(photo.getShioriId())
				.orElseThrow(() -> new ResourceNotFoundException("しおりが見つかりません"));

		accessHelper.requireActiveMember(photo.getShioriId(), callerId);

		boolean isUploader = photo.getUserId().equals(callerId);
		boolean isOwner = shiori.getOwnerId().equals(callerId);

		if (!isUploader && !isOwner) {
			throw new ForbiddenException("写真を操作できるのは投稿者本人または作成者のみです");
		}
	}

	private PhotoResponse toResponse(
			Photo photo,
			Map<UUID, ShioriDay> dayById,
			Map<UUID, User> userById) {

		ShioriDay day = dayById.get(photo.getDayId());
		User user = userById.get(photo.getUserId());

		return new PhotoResponse(
				photo.getId(),
				photo.getDayId(),
				day != null ? day.getDayNumber() : 0,
				photo.getUserId(),
				user != null ? user.getUsername() : "",
				buildImageUrl(photo.getImagePath()),
				photo.isDeleted(),
				photoLikeRepository.countByPhotoId(photo.getId()),
				photo.getCreatedAt());
	}

	private String buildImageUrl(String imagePath) {
		return supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + imagePath;
	}

	private String extractExtension(String filename) {

		if (filename == null || !filename.contains(".")) {
			return "";
		}

		return filename.substring(filename.lastIndexOf('.'));
	}
}
