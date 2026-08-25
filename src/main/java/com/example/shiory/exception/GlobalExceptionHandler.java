package com.example.shiory.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;



@RestControllerAdvice
public class GlobalExceptionHandler {
	
	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<String> handleResourceNotFound (
			ResourceNotFoundException e) {
		
		return ResponseEntity
				.status(HttpStatus.NOT_FOUND)
				.body(e.getMessage());
	}
	
	@ExceptionHandler(BadRequestException.class)
	public ResponseEntity<String> handleBadRequest (
			BadRequestException e) {
		
		return ResponseEntity
				.status(HttpStatus.BAD_REQUEST)
				.body(e.getMessage());
	}
	
	@ExceptionHandler(ForbiddenException.class)
	public ResponseEntity<String> handleForbidden (
			ForbiddenException e) {
		
		return ResponseEntity
				.status(HttpStatus.FORBIDDEN)
				.body(e.getMessage());
	}
	

}
