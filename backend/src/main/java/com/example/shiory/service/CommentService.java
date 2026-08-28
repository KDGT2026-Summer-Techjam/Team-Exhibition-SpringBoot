package com.example.shiory.service;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.shiory.constant.CommentTargetType;
import com.example.shiory.dto.CommentCreateRequest;
import com.example.shiory.dto.CommentResponse;
import com.example.shiory.dto.CommentUpdateRequest;
import com.example.shiory.entity.Comment;
import com.example.shiory.entity.Shiori;
import com.example.shiory.entity.ShioriDay;
import com.example.shiory.entity.Photo;
import com.example.shiory.entity.RoadmapItem;
import com.example.shiory.entity.User;
import com.example.shiory.exception.BadRequestException;
import com.example.shiory.exception.ForbiddenException;
import com.example.shiory.exception.ResourceNotFoundException;
import com.example.shiory.repository.CommentRepository;
import com.example.shiory.repository.PhotoRepository;
import com.example.shiory.repository.RoadmapItemRepository;
import com.example.shiory.repository.ShioriDayRepository;
import com.example.shiory.repository.ShioriRepository;
import com.example.shiory.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class CommentService {

	private static final int COMMENT_MAX_LENGTH = 20;

	private static final Set<String> SHIORI_TARGET_FIELDS = Set.of(
			"title", "description", "period", "promises", "packing", "cost_summary");

	private static final Set<String> SHIORI_DAY_TARGET_FIELDS = Set.of(
			"title", "notes", "estimated_cost", "representative_photo");

	private final CommentRepository commentRepository;
	private final ShioriRepository shioriRepository;
	private final ShioriDayRepository shioriDayRepository;
	private final RoadmapItemRepository roadmapItemRepository;
	private final PhotoRepository photoRepository;
	private final UserRepository userRepository;
	private final ShioriAccessHelper accessHelper;

	@Transactional
	public CommentResponse createComment(CommentCreateRequest request, UUID userId) {

		if (request.getShioriId() == null
				|| request.getTargetId() == null
				|| request.getTargetType() == null) {

			throw new BadRequestException("コメント対象の情報が不足しています");
		}

		Shiori shiori = accessHelper.requireActiveMemberWithShiori(request.getShioriId(), userId);

		validateBody(request.getBody());
		validateTarget(request, shiori);
		requireCommentOpenForPost(request, shiori);

		Comment comment = new Comment();

		comment.setShioriId(request.getShioriId());
		comment.setAuthorId(userId);
		comment.setBody(request.getBody());
		comment.setTargetType(request.getTargetType());
		comment.setTargetId(request.getTargetId());
		comment.setTargetField(request.getTargetField());

		return toResponse(commentRepository.save(comment));
	}

	@Transactional(readOnly = true)
	public List<CommentResponse> getComments(UUID shioriId, UUID callerId) {

		accessHelper.requireActiveMember(shioriId, callerId);

		shioriRepository.findById(shioriId)
				.filter(s -> s.getDeletedAt() == null)
				.orElseThrow(() -> new ResourceNotFoundException("しおりが見つかりません"));

		return commentRepository.findByShioriIdOrderByCreatedAtAsc(shioriId)
				.stream()
				.map(this::toResponse)
				.toList();
	}

	@Transactional(readOnly = true)
	public CommentResponse getComment(UUID commentId, UUID callerId) {

		Comment comment = commentRepository.findById(commentId)
				.orElseThrow(() -> new ResourceNotFoundException("コメントが見つかりません"));

		accessHelper.requireActiveMember(comment.getShioriId(), callerId);

		return toResponse(comment);
	}

	@Transactional
	public CommentResponse updateComment(
			UUID commentId,
			CommentUpdateRequest request,
			UUID userId) {

		Comment comment = commentRepository.findById(commentId)
				.orElseThrow(() -> new ResourceNotFoundException("コメントが見つかりません"));

		if (!comment.getAuthorId().equals(userId)) {
			throw new ForbiddenException("コメントを編集できるのは投稿者本人のみです");
		}

		validateBody(request.getBody());
		comment.setBody(request.getBody());

		return toResponse(commentRepository.save(comment));
	}

	@Transactional
	public void deleteComment(UUID commentId, UUID userId) {

		Comment comment = commentRepository.findById(commentId)
				.orElseThrow(() -> new ResourceNotFoundException("コメントが見つかりません"));

		Shiori shiori = shioriRepository.findById(comment.getShioriId())
				.orElseThrow(() -> new ResourceNotFoundException("しおりが見つかりません"));

		boolean isAuthor = comment.getAuthorId().equals(userId);
		boolean isOwner = shiori.getOwnerId().equals(userId);

		if (!isAuthor && !isOwner) {
			throw new ForbiddenException("コメントを削除できるのは投稿者またはしおりの作成者のみです");
		}

		commentRepository.delete(comment);
	}

	private void validateBody(String body) {

		if (body == null || body.isBlank()) {
			throw new BadRequestException("コメント本文を入力してください");
		}

		if (body.codePointCount(0, body.length()) > COMMENT_MAX_LENGTH) {
			throw new BadRequestException("コメントは20文字以内で入力してください");
		}
	}

	private void validateTarget(CommentCreateRequest request, Shiori shiori) {

		if (!CommentTargetType.SHIORI.equals(request.getTargetType())
				&& !CommentTargetType.SHIORI_DAY.equals(request.getTargetType())
				&& !CommentTargetType.ROADMAP_ITEM.equals(request.getTargetType())
				&& !CommentTargetType.PHOTO.equals(request.getTargetType())) {

			throw new BadRequestException("不正なコメント対象です");
		}

		if ((CommentTargetType.SHIORI.equals(request.getTargetType())
				|| CommentTargetType.SHIORI_DAY.equals(request.getTargetType()))
				&& (request.getTargetField() == null || request.getTargetField().isBlank())) {

			throw new BadRequestException("コメント対象の項目を指定してください");
		}

		if ((CommentTargetType.ROADMAP_ITEM.equals(request.getTargetType())
				|| CommentTargetType.PHOTO.equals(request.getTargetType()))
				&& request.getTargetField() != null) {

			throw new BadRequestException("このコメント対象ではtargetFieldを指定できません");
		}

		if (CommentTargetType.SHIORI.equals(request.getTargetType())) {

			if (!SHIORI_TARGET_FIELDS.contains(request.getTargetField())) {
				throw new BadRequestException("不正なコメント対象項目です");
			}

			if (!request.getShioriId().equals(request.getTargetId())) {
				throw new BadRequestException("コメント対象のしおりが一致しません");
			}
		}

		if (CommentTargetType.SHIORI_DAY.equals(request.getTargetType())) {

			if (!SHIORI_DAY_TARGET_FIELDS.contains(request.getTargetField())) {
				throw new BadRequestException("不正なコメント対象項目です");
			}

			ShioriDay shioriDay = shioriDayRepository.findById(request.getTargetId())
					.orElseThrow(() -> new ResourceNotFoundException("日次ページが見つかりません"));

			if (!shioriDay.getShioriId().equals(request.getShioriId())) {
				throw new BadRequestException("コメント対象の日次ページがこのしおりに属していません");
			}
		}

		if (CommentTargetType.ROADMAP_ITEM.equals(request.getTargetType())) {

			RoadmapItem roadmapItem = roadmapItemRepository.findById(request.getTargetId())
					.orElseThrow(() -> new ResourceNotFoundException("予定が見つかりません"));

			ShioriDay shioriDay = shioriDayRepository.findById(roadmapItem.getDayId())
					.orElseThrow(() -> new ResourceNotFoundException("予定の日次ページが見つかりません"));

			if (!shioriDay.getShioriId().equals(request.getShioriId())) {
				throw new BadRequestException("コメント対象の予定がこのしおりに属していません");
			}
		}

		if (CommentTargetType.PHOTO.equals(request.getTargetType())) {

			Photo photo = photoRepository.findById(request.getTargetId())
					.orElseThrow(() -> new ResourceNotFoundException("写真が見つかりません"));

			if (!photo.getShioriId().equals(request.getShioriId())) {
				throw new BadRequestException("コメント対象の写真がこのしおりに属していません");
			}
		}
	}

	private void requireCommentOpenForPost(CommentCreateRequest request, Shiori shiori) {

		if (CommentTargetType.SHIORI.equals(request.getTargetType())) {

			if (!shiori.isCommentOpen()) {
				throw new ForbiddenException("このページではコメント投稿が許可されていません");
			}

			return;
		}

		if (CommentTargetType.PHOTO.equals(request.getTargetType())) {

			if (!shiori.isCommentOpen()) {
				throw new ForbiddenException("このページではコメント投稿が許可されていません");
			}

			return;
		}

		if (CommentTargetType.SHIORI_DAY.equals(request.getTargetType())) {

			ShioriDay day = shioriDayRepository.findById(request.getTargetId())
					.orElseThrow(() -> new ResourceNotFoundException("日次ページが見つかりません"));

			if (!day.isCommentOpen()) {
				throw new ForbiddenException("このページではコメント投稿が許可されていません");
			}

			return;
		}

		if (CommentTargetType.ROADMAP_ITEM.equals(request.getTargetType())) {

			RoadmapItem item = roadmapItemRepository.findById(request.getTargetId())
					.orElseThrow(() -> new ResourceNotFoundException("予定が見つかりません"));

			ShioriDay day = shioriDayRepository.findById(item.getDayId())
					.orElseThrow(() -> new ResourceNotFoundException("日次ページが見つかりません"));

			if (!day.isCommentOpen()) {
				throw new ForbiddenException("このページではコメント投稿が許可されていません");
			}
		}
	}

	private CommentResponse toResponse(Comment comment) {

		User author = userRepository.findById(comment.getAuthorId())
				.orElseThrow(() -> new ResourceNotFoundException("ユーザーが見つかりません"));

		return new CommentResponse(
				comment.getId(),
				comment.getShioriId(),
				comment.getAuthorId(),
				author.getUsername(),
				comment.getBody(),
				comment.getTargetType(),
				comment.getTargetId(),
				comment.getTargetField(),
				comment.getCreatedAt(),
				comment.getUpdatedAt());
	}
}
