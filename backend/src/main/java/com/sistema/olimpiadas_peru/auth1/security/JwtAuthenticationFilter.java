package com.sistema.olimpiadas_peru.auth1.security;

import com.sistema.olimpiadas_peru.auth1.model.Usuario;
import com.sistema.olimpiadas_peru.auth1.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final TokenBlacklistService tokenBlacklistService;
    private final UsuarioRepository usuarioRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {

        String token = extractToken(request);

        if (token != null
            && !tokenBlacklistService.isBlacklisted(token)
            && jwtTokenProvider.validateToken(token)
            && "ACCESS".equalsIgnoreCase(jwtTokenProvider.getTokenType(token))
            && SecurityContextHolder.getContext().getAuthentication() == null) {

            Integer userId = jwtTokenProvider.getUserIdFromToken(token);
            Usuario usuario = usuarioRepository.findWithRolAndModulosById(userId).orElse(null);

            if (usuario != null && usuario.getEstado() == Usuario.Estado.ACTIVO) {
                AuthenticatedUser principal = new AuthenticatedUser(
                    usuario.getId(),
                    usuario.getEmail(),
                    usuario.getRol() != null ? usuario.getRol().getNombre() : null
                );

                UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(principal, null, List.of());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
