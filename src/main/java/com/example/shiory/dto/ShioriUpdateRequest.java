package com.example.shiory.dto;

import lombok.Getter;

@Getter
public class ShioriUpdateRequest {

	private String title;
	private String description;
	private String promises;
	private Boolean editable;
	private Boolean commentOpen;

	private boolean titlePresent;
	private boolean descriptionPresent;
	private boolean promisesPresent;
	private boolean editablePresent;
	private boolean commentOpenPresent;

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

	public void setEditable(Boolean editable) {
		this.editable = editable;
		this.editablePresent = true;
	}

	public void setCommentOpen(Boolean commentOpen) {
		this.commentOpen = commentOpen;
		this.commentOpenPresent = true;
	}
}