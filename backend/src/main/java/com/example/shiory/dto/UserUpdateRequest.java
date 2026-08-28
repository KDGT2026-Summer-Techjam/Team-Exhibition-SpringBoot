package com.example.shiory.dto;

import lombok.Getter;

@Getter
public class UserUpdateRequest {

	private String username;
	private String password;

	private boolean usernamePresent;
	private boolean passwordPresent;

	public void setUsername(String username) {
		this.username = username;
		this.usernamePresent = true;
	}

	public void setPassword(String password) {
		this.password = password;
		this.passwordPresent = true;
	}
}
