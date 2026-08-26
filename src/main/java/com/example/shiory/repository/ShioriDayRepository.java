package com.example.shiory.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.shiory.entity.ShioriDay;

public interface ShioriDayRepository extends JpaRepository<ShioriDay, UUID> {

	boolean existsByShioriId(UUID shioriId);

	List<ShioriDay> findByShioriIdAndDayNumberGreaterThanOrderByDayNumberDesc(
			UUID shioriId,
			int dayNumber
	);

	List<ShioriDay> findByShioriIdAndDayNumberGreaterThanOrderByDayNumberAsc(
			UUID shioriId,
			int dayNumber
	);

	Optional<ShioriDay> findTopByShioriIdOrderByDayNumberDesc(
			UUID shioriId
	);

	List<ShioriDay> findByShioriIdOrderByDayNumberAsc(UUID shioriId);
}
