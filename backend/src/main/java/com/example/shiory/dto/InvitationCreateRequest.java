package com.example.shiory.dto;

import jakarta.validation.constraints.Email;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InvitationCreateRequest {

	// ログイン必須の受領画面でパスワード確認するため、招待作成時のメール入力は必須にしない
	@Email
	private String inviteeEmail;

	private String message;
}
