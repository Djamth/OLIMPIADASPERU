package com.sistema.olimpiadas_peru.auth1.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResetPasswordRequestDTO {
    private String email;
    private String codigo;
    private String nuevaPassword;
}
