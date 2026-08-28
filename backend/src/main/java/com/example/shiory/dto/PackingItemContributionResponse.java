package com.example.shiory.dto;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PackingItemContributionResponse {

	private UUID userId;
	private String userName;
	private int quantity;
}
