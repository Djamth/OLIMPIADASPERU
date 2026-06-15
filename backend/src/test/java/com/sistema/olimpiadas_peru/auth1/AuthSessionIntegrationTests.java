package com.sistema.olimpiadas_peru.auth1;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthSessionIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private LoginResponseDTO session;

    @BeforeEach
    void setUp() {
        Rol rol = rolRepository.save(Rol.builder()
            .nombre("sesion_test")
            .estado(Rol.Estado.ACTIVO)
            .build());

        usuarioRepository.save(Usuario.builder()
            .nombre("Usuario Sesion")
            .email("sesion.test@olimpiadasperu.pe")
            .password(passwordEncoder.encode("Admin123*"))
            .rol(rol)
            .estado(Usuario.Estado.ACTIVO)
            .eliminado(false)
            .build());

        session = usuarioService.login(LoginRequestDTO.builder()
            .email("sesion.test@olimpiadasperu.pe")
            .password("Admin123*")
            .build());
    }

    @Test
    void meRequiresAccessTokenAndReturnsCurrentUser() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
            .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/auth/me")
                .header("Authorization", "Bearer " + session.getAccessToken()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("sesion.test@olimpiadasperu.pe"));
    }

    @Test
    void refreshRotatesTokenAndRejectsReuse() throws Exception {
        mockMvc.perform(post("/api/auth/refresh-token")
                .header("Authorization", "Bearer " + session.getRefreshToken())
                .header("X-Auth-Mode", "bearer")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.accessToken").isNotEmpty())
            .andExpect(jsonPath("$.refreshToken").isNotEmpty());

        mockMvc.perform(post("/api/auth/refresh-token")
                .header("Authorization", "Bearer " + session.getRefreshToken())
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void browserLoginUsesHttpOnlyCookiesAndDoesNotExposeTokens() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(LoginRequestDTO.builder()
                    .email("sesion.test@olimpiadasperu.pe")
                    .password("Admin123*")
                    .build())))
            .andExpect(status().isOk())
            .andExpect(cookie().httpOnly("op_access_token", true))
            .andExpect(cookie().httpOnly("op_refresh_token", true))
            .andExpect(jsonPath("$.accessToken").doesNotExist())
            .andExpect(jsonPath("$.refreshToken").doesNotExist());
    }

    @Test
    void bearerModeKeepsPostmanCompatible() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .header("X-Auth-Mode", "bearer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(LoginRequestDTO.builder()
                    .email("sesion.test@olimpiadasperu.pe")
                    .password("Admin123*")
                    .build())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.accessToken").isNotEmpty())
            .andExpect(jsonPath("$.refreshToken").isNotEmpty());
    }

    @Test
    void loginValidatesMalformedPayload() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(LoginRequestDTO.builder()
                    .email("correo-invalido")
                    .password("")
                    .build())))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value("Error de validacion"));
    }
}
