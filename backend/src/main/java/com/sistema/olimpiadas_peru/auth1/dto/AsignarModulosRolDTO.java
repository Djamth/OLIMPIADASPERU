package com.sistema.olimpiadas_peru.auth1.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AsignarModulosRolDTO {
    private List<Integer> moduloIds;
}
