package com.example.shiory.service;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.shiory.constant.CommentTargetType;
import com.example.shiory.dto.CommentCreateRequest;
import com.example.shiory.dto.CommentUpdateRequest;
import com.example.shiory.entity.Comment;
import com.example.shiory.entity.Shiori;
import com.example.shiory.entity.ShioriDay;
import com.example.shiory.entity.RoadmapItem;
import com.example.shiory.exception.BadRequestException;
import com.example.shiory.exception.ForbiddenException;
import com.example.shiory.exception.ResourceNotFoundException;
import com.example.shiory.repository.CommentRepository;
import com.example.shiory.repository.RoadmapItemRepository;
import com.example.shiory.repository.ShioriDayRepository;
import com.example.shiory.repository.ShioriRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class CommentService {

	private static final Set<String> SHIORI_TARGET_FIELDS =
			Set.of("title", "description", "period", "promises");

	private static final Set<String> SHIORI_DAY_TARGET_FIELDS =
			Set.of("title", "notes", "estimated_cost", "representative_photo");

	private final CommentRepository commentRepository;
	private final ShioriRepository shioriRepository;
	private final ShioriDayRepository shioriDayRepository;
	private final RoadmapItemRepository roadmapItemRepository;

	@Transactional
	public Comment createComment(
			CommentCreateRequest request,
			UUID userId) {

		if (request.getShioriId() == null
				|| request.getTargetId() == null
				|| request.getTargetType() == null) {

			throw new BadRequestException("コメント対象の情報が不足しています");
		}

		// ① しおり自体のチェック
		Shiori shiori = shioriRepository.findById(request.getShioriId())
				.orElseThrow(() ->
						new ResourceNotFoundException("しおりが見つかりません"));

		if (!shiori.isCommentOpen()) {
			throw new BadRequestException(
					"このしおりではコメント投稿が許可されていません");
		}

		if (request.getBody() == null || request.getBody().isBlank()) {
			throw new BadRequestException("コメント本文を入力してください");
		}

		// ② targetType が正しいか
		if (!CommentTargetType.SHIORI.equals(request.getTargetType())
				&& !CommentTargetType.SHIORI_DAY.equals(request.getTargetType())
				&& !CommentTargetType.ROADMAP_ITEM.equals(request.getTargetType())
				&& !CommentTargetType.PHOTO.equals(request.getTargetType())) {

			throw new BadRequestException("不正なコメント対象です");
		}

		// ③ shiori / shiori_day は targetField 必須
		if ((CommentTargetType.SHIORI.equals(request.getTargetType())
				|| CommentTargetType.SHIORI_DAY.equals(request.getTargetType()))
				&& (request.getTargetField() == null
						|| request.getTargetField().isBlank())) {

			throw new BadRequestException(
					"コメント対象の項目を指定してください");
		}

		// ④ roadmap_item / photo は targetField を指定できない
		if ((CommentTargetType.ROADMAP_ITEM.equals(request.getTargetType())
				|| CommentTargetType.PHOTO.equals(request.getTargetType()))
				&& request.getTargetField() != null) {

			throw new BadRequestException(
					"このコメント対象ではtargetFieldを指定できません");
		}

		// ⑤ shiori の詳細チェック
		if (CommentTargetType.SHIORI.equals(request.getTargetType())) {

			if (!SHIORI_TARGET_FIELDS.contains(request.getTargetField())) {
				throw new BadRequestException(
						"不正なコメント対象項目です");
			}

			if (!request.getShioriId().equals(request.getTargetId())) {
				throw new BadRequestException(
						"コメント対象のしおりが一致しません");
			}
		}

		// ⑥ shiori_day の詳細チェック
		if (CommentTargetType.SHIORI_DAY.equals(request.getTargetType())) {

			if (!SHIORI_DAY_TARGET_FIELDS.contains(request.getTargetField())) {
				throw new BadRequestException(
						"不正なコメント対象項目です");
			}

			ShioriDay shioriDay =
					shioriDayRepository.findById(request.getTargetId())
							.orElseThrow(() ->
									new ResourceNotFoundException(
											"日次ページが見つかりません"));

			if (!shioriDay.getShioriId().equals(request.getShioriId())) {
				throw new BadRequestException(
						"コメント対象の日次ページがこのしおりに属していません");
			}
		}

		// ⑦ roadmap_item のチェック
		if (CommentTargetType.ROADMAP_ITEM.equals(request.getTargetType())) {

			RoadmapItem roadmapItem =
					roadmapItemRepository.findById(request.getTargetId())
							.orElseThrow(() ->
									new ResourceNotFoundException("予定が見つかりません"));

			ShioriDay shioriDay =
					shioriDayRepository.findById(roadmapItem.getDayId())
							.orElseThrow(() ->
									new ResourceNotFoundException("予定の日次ページが見つかりません"));

			if (!shioriDay.getShioriId().equals(request.getShioriId())) {
				throw new BadRequestException("コメント対象の予定がこのしおりに属していません");
			}
		}

		// ⑧ photo のチェック


		// ⑨ Comment を作成して保存
		Comment comment = new Comment();

		comment.setShioriId(request.getShioriId());
		comment.setAuthorId(userId);
		comment.setBody(request.getBody());
		comment.setTargetType(request.getTargetType());
		comment.setTargetId(request.getTargetId());
		comment.setTargetField(request.getTargetField());

		return commentRepository.save(comment);
	}

	@Transactional(readOnly = true)
	public List<Comment> getComments(UUID shioriId) {

		Shiori shiori = shioriRepository.findById(shioriId)
				.orElseThrow(() ->
						new ResourceNotFoundException("しおりが見つかりません"));

		if (!shiori.isCommentOpen()) {
			throw new ForbiddenException("このしおりのコメントは現在公開されていません");
		}

		return commentRepository.findByShioriIdOrderByCreatedAtAsc(shioriId);
	}

	@Transactional(readOnly = true)
	public Comment getComment(UUID commentId) {

		Comment comment = commentRepository.findById(commentId)
				.orElseThrow(() ->
						new ResourceNotFoundException("コメントが見つかりません"));

		Shiori shiori = shioriRepository.findById(comment.getShioriId())
				.orElseThrow(() ->
						new ResourceNotFoundException("しおりが見つかりません"));

		if (!shiori.isCommentOpen()) {
			throw new ForbiddenException("このしおりのコメントは現在公開されていません");
		}

		return comment;
	}

	@Transactional
	public Comment updateComment(
			UUID commentId,
			CommentUpdateRequest request,
			UUID userId) {

		Comment comment = commentRepository.findById(commentId)
				.orElseThrow(() ->
						new ResourceNotFoundException("コメントが見つかりません"));

		if (!comment.getAuthorId().equals(userId)) {
			throw new ForbiddenException("コメントを編集できるのは投稿者本人のみです");
		}

		if (request.getBody() == null || request.getBody().isBlank()) {
			throw new BadRequestException("コメント本文を入力してください");
		}

		comment.setBody(request.getBody());

		return commentRepository.save(comment);
	}

	@Transactional
	public void deleteComment(
			UUID commentId,
			UUID userId) {

		Comment comment = commentRepository.findById(commentId)
				.orElseThrow(() ->
						new ResourceNotFoundException("コメントが見つかりません"));

		Shiori shiori = shioriRepository.findById(comment.getShioriId())
				.orElseThrow(() ->
						new ResourceNotFoundException("しおりが見つかりません"));

		boolean isAuthor = comment.getAuthorId().equals(userId);
		boolean isOwner = shiori.getOwnerId().equals(userId);

		if (!isAuthor && !isOwner) {
			throw new ForbiddenException("コメントを削除できるのは投稿者またはしおりの作成者のみです");
		}

		commentRepository.delete(comment);
	}
}