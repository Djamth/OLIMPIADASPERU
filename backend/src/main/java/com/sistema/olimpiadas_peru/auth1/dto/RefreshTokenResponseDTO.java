package com.sistema.olimpiadas_peru.auth1.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RefreshTokenResponseDTO {
    private String accessToken;
    private String refreshToken;
    private Long expiresIn;
    private String tokenType;
}
