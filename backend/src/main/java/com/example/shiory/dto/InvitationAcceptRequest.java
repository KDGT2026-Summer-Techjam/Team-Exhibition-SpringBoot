package com.example.shiory.dto;

import jakarta.validation.constraints.NotBlank;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InvitationAcceptRequest {

	@NotBlank
	private String password;
}
