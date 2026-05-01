package com.sistema.olimpiadas_peru.auth1.repository;

import com.sistema.olimpiadas_peru.auth1.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByTokenAndUsadoFalse(String token);

    Optional<PasswordResetToken> findByUsuario_EmailIgnoreCaseAndTokenAndUsadoFalse(String email, String token);

    void deleteByUsuario_Id(Integer usuarioId);

    void deleteByFechaExpiracionBefore(LocalDateTime fecha);
}
