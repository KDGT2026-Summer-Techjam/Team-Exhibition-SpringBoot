package com.example.shiory.dto;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PackingItemResponse {
	
	private UUID id;

	private String name;

	private int requiredCount;

	private long checkedCount;

	private boolean checkedByMe;
}
