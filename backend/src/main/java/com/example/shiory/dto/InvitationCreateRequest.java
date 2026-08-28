package com.example.shiory.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InvitationCreateRequest {

	@NotBlank
	@Email
	private String inviteeEmail;

	private String message;
}
