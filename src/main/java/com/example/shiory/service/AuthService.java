package com.example.shiory.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.shiory.dto.LoginRequest;
import com.example.shiory.entity.User;
import com.example.shiory.exception.BadRequestException;
import com.example.shiory.repository.UserRepository;
import com.example.shiory.security.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;

	public String login(LoginRequest request) {

		User user = userRepository
				.findByUsernameOrEmail(request.getUsernameOrEmail(), request.getUsernameOrEmail())
				.orElseThrow(() -> new BadRequestException("ユーザー名/メールアドレスまたはパスワードが正しくありません"));

		if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
			throw new BadRequestException("ユーザー名/メールアドレスまたはパスワードが正しくありません");
		}

		return jwtService.generateToken(user.getId().toString());
	}
}
