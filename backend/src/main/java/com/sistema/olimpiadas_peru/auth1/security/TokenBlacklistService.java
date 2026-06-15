package com.sistema.olimpiadas_peru.auth1.security;

import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlacklistService {

    private final JwtTokenProvider jwtTokenProvider;
    private final Map<String, Long> blacklistedTokens = new ConcurrentHashMap<>();

    public TokenBlacklistService(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public void blacklist(String token) {
        if (token != null && !token.isBlank()) {
            try {
                Date expiration = jwtTokenProvider.getExpirationFromToken(token);
                blacklistedTokens.put(token, expiration.getTime());
            } catch (RuntimeException ignored) {
                // Un token invalido ya sera rechazado por JwtTokenProvider.
            }
        }
    }

    public boolean isBlacklisted(String token) {
        if (token == null) {
            return false;
        }

        long now = System.currentTimeMillis();
        blacklistedTokens.entrySet().removeIf(entry -> entry.getValue() <= now);
        return blacklistedTokens.containsKey(token);
    }
}
