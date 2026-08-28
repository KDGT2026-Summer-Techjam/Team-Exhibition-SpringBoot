package com.example.shiory.service;

import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.shiory.dto.UserCreateRequest;
import com.example.shiory.dto.UserPasswordUpdateRequest;
import com.example.shiory.dto.UserResponse;
import com.example.shiory.dto.UserUpdateRequest;
import com.example.shiory.entity.User;
import com.example.shiory.exception.BadRequestException;
import com.example.shiory.exception.ConflictException;
import com.example.shiory.exception.ResourceNotFoundException;
import com.example.shiory.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public User createUser(UserCreateRequest request) {

		if (userRepository.existsByUsername(request.getUsername())) {
			throw new ConflictException("このユーザー名は既に使用されています");
		}

		if (userRepository.existsByEmail(request.getEmail())) {
			throw new ConflictException("このメールアドレスは既に使用されています");
		}

		User user = new User();

		user.setUsername(request.getUsername());
		user.setEmail(request.getEmail());
		user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

		return userRepository.save(user);
	}

	@Transactional
	public void updateUser(UUID userId, UserUpdateRequest request) {

		if (!request.isUsernamePresent()) {
			throw new BadRequestException("更新する項目を指定してください");
		}

		User user = userRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("ユーザーが見つかりません"));

		if (request.getUsername() == null || request.getUsername().isBlank()) {
			throw new BadRequestException("ユーザー名を入力してください");
		}

		if (request.getUsername().length() > 50) {
			throw new BadRequestException("ユーザー名は50文字以内で入力してください");
		}

		if (!user.getUsername().equals(request.getUsername())
				&& userRepository.existsByUsername(request.getUsername())) {
			throw new ConflictException("このユーザー名は既に使用されています");
		}

		user.setUsername(request.getUsername());
		userRepository.save(user);
	}

	@Transactional
	public void updatePassword(UUID userId, UserPasswordUpdateRequest request) {

		User user = userRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("ユーザーが見つかりません"));

		if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
			throw new BadRequestException("現在のパスワードが正しくありません");
		}

		if (request.getNewPassword().length() < 10) {
			throw new BadRequestException("パスワードは10文字以上で入力してください");
		}

		user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
		userRepository.save(user);
	}

	@Transactional(readOnly = true)
	public UserResponse getMe(UUID userId) {

		User user = userRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("ユーザーが見つかりません"));

		return new UserResponse(
				user.getId(),
				user.getUsername(),
				user.getEmail(),
				user.getCreatedAt());
	}
}
