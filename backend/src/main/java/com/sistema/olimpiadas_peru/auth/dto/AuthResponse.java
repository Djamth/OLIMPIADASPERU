package com.sistema.olimpiadas_peru.auth.dto;

import com.sistema.olimpiadas_peru.auth.entity.Role;
import java.util.Set;

public record AuthResponse(
        String token,
        String tokenType,
        Long userId,
        String username,
        Set<Role> roles) {
}
