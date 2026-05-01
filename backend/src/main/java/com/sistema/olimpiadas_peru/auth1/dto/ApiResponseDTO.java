package com.sistema.olimpiadas_peru.auth1.dto;
import lombok.*;
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponseDTO {

    private String mensaje;
    private Object data;
    
}
