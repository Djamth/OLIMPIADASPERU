package com.sistema.olimpiadas_peru.common.payload;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;

@Builder
public record ApiErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        String path,
        List<String> details) {
}
