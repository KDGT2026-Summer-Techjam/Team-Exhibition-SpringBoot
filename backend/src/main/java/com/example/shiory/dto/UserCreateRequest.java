package com.example.shiory.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserCreateRequest {

	@NotBlank
	@Size(min = 1, max = 50)
	private String username;

	@NotBlank
	@Email
	private String email;

	@NotBlank
	@Size(min = 10)
	private String password;
}