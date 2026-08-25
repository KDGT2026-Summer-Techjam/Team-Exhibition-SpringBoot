package com.example.shiory.service;

import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.shiory.dto.UserCreateRequest;
import com.example.shiory.dto.UserUpdateRequest;
import com.example.shiory.entity.User;
import com.example.shiory.exception.BadRequestException;
import com.example.shiory.exception.ResourceNotFoundException;
import com.example.shiory.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public User createUser(UserCreateRequest request) {

		// ユーザー名の重複チェック
		if (userRepository.existsByUsername(request.getUsername())) {
			throw new IllegalArgumentException("このユーザー名は既に使用されています");
		}

		// メールアドレスの重複チェック
		if (userRepository.existsByEmail(request.getEmail())) {
			throw new IllegalArgumentException("このメールアドレスは既に使用されています");
		}

		// User Entityを作成
		User user = new User();

		user.setUsername(request.getUsername());
		user.setEmail(request.getEmail());

		// パスワードをハッシュ化
		user.setPasswordHash(
				passwordEncoder.encode(request.getPassword()));

		// DBに保存
		return userRepository.save(user);
	}

	@Transactional
	public void updateUser(UUID userId, UserUpdateRequest request) {

		User user = userRepository.findById(userId)
				.orElseThrow(() ->
						new ResourceNotFoundException("ユーザーが見つかりません"));

		if (request.isUsernamePresent()) {

			if (request.getUsername() == null
					|| request.getUsername().isBlank()) {
				throw new BadRequestException("ユーザー名を入力してください");
			}

			if (request.getUsername().length() > 50) {
				throw new BadRequestException("ユーザー名は50文字以内で入力してください");
			}

			if (!user.getUsername().equals(request.getUsername())
					&& userRepository.existsByUsername(request.getUsername())) {
				throw new BadRequestException("このユーザー名は既に使用されています");
			}

			user.setUsername(request.getUsername());
		}

		if (request.isPasswordPresent()) {

			if (request.getPassword() == null
					|| request.getPassword().isBlank()) {
				throw new BadRequestException("パスワードを入力してください");
			}

			if (request.getPassword().length() < 10) {
				throw new BadRequestException("パスワードは10文字以上で入力してください");
			}

			user.setPasswordHash(
					passwordEncoder.encode(request.getPassword()));
		}

		userRepository.save(user);
	}
}
