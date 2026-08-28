package com.example.shiory.dto;

import java.util.List;
import java.util.UUID;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ShioriPagePermissionsUpdateRequest {

	private Boolean editable;
	private Boolean commentOpen;
	private List<DayPermissionUpdate> days;

	@Getter
	@Setter
	public static class DayPermissionUpdate {

		private UUID dayId;
		private Boolean editable;
		private Boolean commentOpen;
	}
}
