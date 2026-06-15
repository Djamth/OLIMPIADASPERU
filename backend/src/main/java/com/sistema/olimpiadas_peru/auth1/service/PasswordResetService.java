package com.sistema.olimpiadas_peru.auth1.service;

import com.sistema.olimpiadas_peru.auth1.model.PasswordResetToken;
import com.sistema.olimpiadas_peru.auth1.model.Usuario;
import com.sistema.olimpiadas_peru.auth1.repository.PasswordResetTokenRepository;
import com.sistema.olimpiadas_peru.auth1.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UsuarioRepository usuarioRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final AuditoriaService auditoriaService;

    @Value("${app.password-reset.expiration-minutes:30}")
    private long expirationMinutes;

    @Transactional
    public void solicitarRecuperacion(String email) {
        passwordResetTokenRepository.deleteByFechaExpiracionBefore(LocalDateTime.now());

        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);

        if (usuario == null
            || usuario.getEstado() != Usuario.Estado.ACTIVO
            || Boolean.TRUE.equals(usuario.getEliminado())) {
            return;
        }

        passwordResetTokenRepository.deleteByUsuario_Id(usuario.getId());

        String token = generarCodigo();
        PasswordResetToken resetToken = PasswordResetToken.builder()
            .token(token)
            .usuario(usuario)
            .fechaExpiracion(LocalDateTime.now().plusMinutes(expirationMinutes))
            .usado(false)
            .build();

        passwordResetTokenRepository.save(resetToken);

        String contenido = """
            Hola %s,

            Recibimos una solicitud para restablecer tu contraseña en Olimpiadas Perú.

            Usa este código de 6 dígitos para continuar con el cambio de tu contraseña:
            %s

            El código expira en %d minutos.

            Si no solicitaste este cambio, puedes ignorar este correo.
            """.formatted(usuario.getNombre(), token, expirationMinutes);

        emailService.enviarCorreo(usuario.getEmail(), "Recuperación de contraseña - Olimpiadas Perú", contenido);

        auditoriaService.registrar(
            usuario.getId(),
            "SOLICITAR_RECUPERACION_PASSWORD",
            "Se solicitó recuperación de contraseña"
        );
    }

    @Transactional
    public void resetearPassword(String email, String codigo, String nuevaPassword) {
        PasswordResetToken resetToken = obtenerTokenValido(email, codigo);
        if (resetToken == null) {
            throw new RuntimeException("El código de recuperación es inválido o ha expirado");
        }

        Usuario usuario = resetToken.getUsuario();
        usuario.setPassword(passwordEncoder.encode(nuevaPassword));
        usuarioRepository.save(usuario);

        resetToken.setUsado(true);
        passwordResetTokenRepository.save(resetToken);
        passwordResetTokenRepository.deleteByFechaExpiracionBefore(LocalDateTime.now());

        auditoriaService.registrar(
            usuario.getId(),
            "RESET_PASSWORD",
            "El usuario actualizó su contraseña mediante recuperación"
        );
    }

    private PasswordResetToken obtenerTokenValido(String email, String codigo) {
        if (email == null || email.isBlank() || codigo == null || codigo.isBlank()) {
            return null;
        }

        return passwordResetTokenRepository.findByUsuario_EmailIgnoreCaseAndTokenAndUsadoFalse(email.trim(), codigo.trim())
            .filter(item -> item.getFechaExpiracion().isAfter(LocalDateTime.now()))
            .orElse(null);
    }

    private String generarCodigo() {
        return "%06d".formatted(SECURE_RANDOM.nextInt(1_000_000));
    }
}
