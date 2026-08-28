package com.example.shiory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserPasswordUpdateRequest {

	@NotBlank
	private String currentPassword;

	@NotBlank
	@Size(min = 10)
	private String newPassword;
}
