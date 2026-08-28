package com.example.shiory.dto;

import lombok.Getter;

@Getter
public class ShioriUpdateRequest {

	private String title;
	private String description;
	private String promises;
	private String password;

	private boolean titlePresent;
	private boolean descriptionPresent;
	private boolean promisesPresent;
	private boolean passwordPresent;

	public void setTitle(String title) {
		this.title = title;
		this.titlePresent = true;
	}

	public void setDescription(String description) {
		this.description = description;
		this.descriptionPresent = true;
	}

	public void setPromises(String promises) {
		this.promises = promises;
		this.promisesPresent = true;
	}

	public void setPassword(String password) {
		this.password = password;
		this.passwordPresent = true;
	}
}