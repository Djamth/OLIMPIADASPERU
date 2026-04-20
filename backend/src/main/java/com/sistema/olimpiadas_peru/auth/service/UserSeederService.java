package com.sistema.olimpiadas_peru.auth.service;

import com.sistema.olimpiadas_peru.auth.entity.Role;
import com.sistema.olimpiadas_peru.auth.entity.User;
import com.sistema.olimpiadas_peru.auth.repository.UserRepository;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserSeederService implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.existsByUsername("admin")) {
            return;
        }

        User admin = new User();
        admin.setNombreCompleto("Administrador General");
        admin.setUsername("admin");
        admin.setEmail("admin@olimpiadasperu.pe");
        admin.setPassword(passwordEncoder.encode("Admin123*"));
        admin.setEnabled(true);
        admin.setRoles(Set.of(Role.ROLE_ADMIN, Role.ROLE_ORGANIZADOR));
        userRepository.save(admin);
    }
}
