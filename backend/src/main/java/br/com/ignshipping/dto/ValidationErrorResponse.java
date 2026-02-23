package br.com.ignshipping.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ValidationErrorResponse(
        int status,
        String message,
        List<FieldError> errors,
        LocalDateTime timestamp
) {
    public record FieldError(
            String field,
            String message
    ) {
    }
}

