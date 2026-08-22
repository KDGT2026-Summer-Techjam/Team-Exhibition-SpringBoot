package com.example.shiory.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.shiory.dto.UserCreateRequest;
import com.example.shiory.entity.User;
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
}