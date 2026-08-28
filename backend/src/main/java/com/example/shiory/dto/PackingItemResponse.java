package com.example.shiory.dto;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PackingItemResponse {

	private UUID id;
	private String label;
	private int requiredCount;
	private List<PackingItemContributionResponse> contributions;
}
