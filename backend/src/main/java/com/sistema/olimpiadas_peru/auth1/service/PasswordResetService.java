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
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

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

        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("El correo ingresado no pertenece a ningun usuario"));

        if (usuario.getEstado() != Usuario.Estado.ACTIVO) {
            throw new RuntimeException("El usuario asociado al correo esta inactivo");
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

            Recibimos una solicitud para restablecer tu contrasena en el Sistema de Votacion.

            Usa este codigo de 6 digitos para continuar con el cambio de tu contrasena:
            %s

            El codigo expira en %d minutos.

            Si no solicitaste este cambio, puedes ignorar este correo.
            """.formatted(usuario.getNombre(), token, expirationMinutes);

        emailService.enviarCorreo(usuario.getEmail(), "Recuperacion de contrasena - Sistema de Votacion", contenido);

        auditoriaService.registrar(
            usuario.getId(),
            "SOLICITAR_RECUPERACION_PASSWORD",
            "Se solicito recuperacion de contrasena"
        );
    }

    @Transactional
    public void resetearPassword(String email, String codigo, String nuevaPassword) {
        PasswordResetToken resetToken = obtenerTokenValido(email, codigo);
        if (resetToken == null) {
            throw new RuntimeException("El codigo de recuperacion es invalido o ha expirado");
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
            "El usuario actualizo su contrasena mediante recuperacion"
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
        return "%06d".formatted(ThreadLocalRandom.current().nextInt(0, 1_000_000));
    }
}
