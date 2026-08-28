package com.example.shiory.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.shiory.entity.Photo;
import com.example.shiory.entity.PhotoLike;
import com.example.shiory.entity.Shiori;
import com.example.shiory.entity.ShioriMember;
import com.example.shiory.exception.BadRequestException;
import com.example.shiory.exception.ForbiddenException;
import com.example.shiory.exception.ResourceNotFoundException;
import com.example.shiory.repository.PhotoLikeRepository;
import com.example.shiory.repository.PhotoRepository;
import com.example.shiory.repository.ShioriMemberRepository;
import com.example.shiory.repository.ShioriRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PhotoLikeService {

	private static final long MAX_LIKES_PER_PHOTO = 999;

	private final PhotoLikeRepository photoLikeRepository;
	private final PhotoRepository photoRepository;
	private final ShioriRepository shioriRepository;
	private final ShioriMemberRepository shioriMemberRepository;

	public void likePhoto(UUID photoId, UUID callerId) {

		Photo photo = photoRepository.findById(photoId)
				.orElseThrow(() -> new ResourceNotFoundException("写真が見つかりません"));

		Shiori shiori = shioriRepository.findById(photo.getShioriId())
				.orElseThrow(() -> new ResourceNotFoundException("しおりが見つかりません"));

		ShioriMember member = shioriMemberRepository
				.findByShioriIdAndUserId(shiori.getId(), callerId)
				.orElseThrow(() -> new ForbiddenException("このしおりのメンバーではありません"));

		if (!"active".equals(member.getStatus())) {
			throw new ForbiddenException("このしおりのメンバーではありません");
		}

		if (photoLikeRepository.countByPhotoId(photoId) >= MAX_LIKES_PER_PHOTO) {
			throw new BadRequestException("いいねの上限に達しています");
		}

		PhotoLike like = new PhotoLike();

		like.setPhotoId(photoId);
		like.setUserId(callerId);

		photoLikeRepository.save(like);
	}
}
