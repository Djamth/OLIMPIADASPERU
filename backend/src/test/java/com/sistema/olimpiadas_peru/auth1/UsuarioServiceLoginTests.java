package com.sistema.olimpiadas_peru.auth1;

import com.sistema.olimpiadas_peru.auth1.dto.LoginRequestDTO;
import com.sistema.olimpiadas_peru.auth1.dto.LoginResponseDTO;
import com.sistema.olimpiadas_peru.auth1.model.Rol;
import com.sistema.olimpiadas_peru.auth1.model.Usuario;
import com.sistema.olimpiadas_peru.auth1.repository.RolRepository;
import com.sistema.olimpiadas_peru.auth1.repository.UsuarioRepository;
import com.sistema.olimpiadas_peru.auth1.service.UsuarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class UsuarioServiceLoginTests {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        Rol rol = Rol.builder()
                .nombre("administrador_test")
                .estado(Rol.Estado.ACTIVO)
                .build();
        rol = rolRepository.save(rol);

        Usuario usuario = Usuario.builder()
                .nombre("Admin Test")
                .email("login.test@olimpiadasperu.pe")
                .password(passwordEncoder.encode("Admin123*"))
                .rol(rol)
                .estado(Usuario.Estado.ACTIVO)
                .eliminado(false)
                .build();
        usuarioRepository.save(usuario);
    }

    @Test
    void loginShouldReturnTokensForActiveUser() {
        LoginResponseDTO response = usuarioService.login(
                LoginRequestDTO.builder()
                        .email("login.test@olimpiadasperu.pe")
                        .password("Admin123*")
                        .build());

        assertThat(response.getAccessToken()).isNotBlank();
        assertThat(response.getRefreshToken()).isNotBlank();
        assertThat(response.getTokenType()).isEqualTo("Bearer");
        assertThat(response.getEmail()).isEqualTo("login.test@olimpiadasperu.pe");
    }
}
