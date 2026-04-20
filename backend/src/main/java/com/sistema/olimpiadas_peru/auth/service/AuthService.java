package com.sistema.olimpiadas_peru.auth.service;

import com.sistema.olimpiadas_peru.auth.dto.AuthResponse;
import com.sistema.olimpiadas_peru.auth.dto.LoginRequest;
import com.sistema.olimpiadas_peru.auth.dto.RegisterRequest;
import com.sistema.olimpiadas_peru.auth.entity.User;
import com.sistema.olimpiadas_peru.auth.repository.UserRepository;
import com.sistema.olimpiadas_peru.auth.security.JwtService;
import com.sistema.olimpiadas_peru.common.exception.BusinessException;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new BusinessException("El nombre de usuario ya existe");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException("El correo ya existe");
        }

        User user = new User();
        user.setNombreCompleto(request.nombreCompleto());
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRoles(request.roles());
        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtService.generateToken(userDetails, Map.of("roles", user.getRoles()));
        return new AuthResponse(token, "Bearer", user.getId(), user.getUsername(), user.getRoles());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password()));

        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new BusinessException("Credenciales invalidas"));
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtService.generateToken(userDetails, Map.of("roles", user.getRoles()));
        return new AuthResponse(token, "Bearer", user.getId(), user.getUsername(), user.getRoles());
    }
}
