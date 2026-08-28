package com.example.shiory.util;

import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

	private SecurityUtils() {
	}

	public static UUID currentUserId() {

		String principal = (String) SecurityContextHolder
				.getContext()
				.getAuthentication()
				.getPrincipal();

		return UUID.fromString(principal);
	}
}
