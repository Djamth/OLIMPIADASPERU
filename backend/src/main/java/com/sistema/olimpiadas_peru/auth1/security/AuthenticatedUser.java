package com.sistema.olimpiadas_peru.auth1.security;

import java.security.Principal;

public record AuthenticatedUser(Integer id, String email, String rolNombre) implements Principal {

    @Override
    public String getName() {
        return email;
    }
}
