package com.example.shiory.service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.shiory.dto.ShioriCreateRequest;
import com.example.shiory.dto.ShioriPeriodUpdateRequest;
import com.example.shiory.entity.Shiori;
import com.example.shiory.entity.ShioriDay;
import com.example.shiory.entity.ShioriMember;
import com.example.shiory.repository.ShioriDayRepository;
import com.example.shiory.repository.ShioriMemberRepository;
import com.example.shiory.repository.ShioriRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShioriService {

	private final ShioriRepository shioriRepository;
	private final ShioriMemberRepository shioriMemberRepository;
	private final ShioriDayRepository shioriDayRepository;
	private final PasswordEncoder passwordEncoder;

	public Shiori createShiori(ShioriCreateRequest request, UUID ownerId) {

		Shiori shiori = new Shiori();

		shiori.setOwnerId(ownerId);
		shiori.setTitle(request.getTitle());
		shiori.setPasswordHash(passwordEncoder.encode(request.getPassword()));

		Shiori savedShiori = shioriRepository.save(shiori);

		ShioriMember ownerMember = new ShioriMember();

		ownerMember.setShioriId(savedShiori.getId());
		ownerMember.setUserId(ownerId);
		ownerMember.setRole("owner");
		ownerMember.setStatus("active");
		ownerMember.setJoinedAt(OffsetDateTime.now());

		shioriMemberRepository.save(ownerMember);

		return savedShiori;
	}

	public void updatePeriod(UUID shioriId, UUID callerId, ShioriPeriodUpdateRequest request) {

		Shiori shiori = shioriRepository.findById(shioriId)
				.orElseThrow(() -> new IllegalArgumentException("しおりが見つかりません"));

		if (!shiori.getOwnerId().equals(callerId)) {
			throw new IllegalArgumentException("期間の設定は作成者のみ行えます");
		}

		if (request.getEndDate().isBefore(request.getStartDate())) {
			throw new IllegalArgumentException("終了日は開始日以降にしてください");
		}

		if (shioriDayRepository.existsByShioriId(shioriId)) {
			throw new IllegalArgumentException("既に日次ページが作成済みのため、期間は変更できません");
		}

		shiori.setStartDate(request.getStartDate());
		shiori.setEndDate(request.getEndDate());

		shioriRepository.save(shiori);

		List<ShioriDay> days = new ArrayList<>();
		int dayNumber = 1;

		for (LocalDate date = request.getStartDate();
				!date.isAfter(request.getEndDate());
				date = date.plusDays(1)) {

			ShioriDay day = new ShioriDay();

			day.setShioriId(shioriId);
			day.setTripDate(date);
			day.setDayNumber(dayNumber);

			days.add(day);
			dayNumber++;
		}

		shioriDayRepository.saveAll(days);
	}
}
