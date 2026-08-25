package com.example.shiory.service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class SupabaseStorageService {

	private final HttpClient httpClient = HttpClient.newHttpClient();
	private final String baseUrl;
	private final String bucket;
	private final String serviceRoleKey;

	public SupabaseStorageService(
			@Value("${supabase.storage.url}") String baseUrl,
			@Value("${supabase.storage.bucket}") String bucket,
			@Value("${supabase.storage.service-role-key}") String serviceRoleKey) {

		this.baseUrl = baseUrl;
		this.bucket = bucket;
		this.serviceRoleKey = serviceRoleKey;
	}

	public String upload(String path, MultipartFile file) {

		try {
			String contentType = file.getContentType() != null
					? file.getContentType()
					: "application/octet-stream";

			HttpRequest request = HttpRequest.newBuilder()
					.uri(URI.create(baseUrl + "/storage/v1/object/" + bucket + "/" + path))
					.header("Authorization", "Bearer " + serviceRoleKey)
					.header("Content-Type", contentType)
					.header("x-upsert", "true")
					.PUT(HttpRequest.BodyPublishers.ofByteArray(file.getBytes()))
					.build();

			HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

			if (response.statusCode() >= 300) {
				throw new IllegalStateException("写真のアップロードに失敗しました: " + response.body());
			}

			return path;

		} catch (IOException | InterruptedException e) {
			throw new IllegalStateException("写真のアップロードに失敗しました", e);
		}
	}
}
