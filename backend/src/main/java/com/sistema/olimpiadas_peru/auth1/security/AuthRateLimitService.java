package com.sistema.olimpiadas_peru.auth1.security;

import java.time.Duration;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthRateLimitService {

    private final Map<String, AttemptWindow> attempts = new ConcurrentHashMap<>();

    @Value("${app.security.rate-limit.login.max-attempts:5}")
    private int loginMaxAttempts;

    @Value("${app.security.rate-limit.login.window-minutes:15}")
    private long loginWindowMinutes;

    @Value("${app.security.rate-limit.password.max-attempts:3}")
    private int passwordMaxAttempts;

    @Value("${app.security.rate-limit.password.window-minutes:30}")
    private long passwordWindowMinutes;

    public void checkLogin(String clientId, String email) {
        check(key("login", clientId, email), loginMaxAttempts, Duration.ofMinutes(loginWindowMinutes));
    }

    public void registerLoginFailure(String clientId, String email) {
        registerFailure(key("login", clientId, email), Duration.ofMinutes(loginWindowMinutes));
    }

    public void resetLogin(String clientId, String email) {
        attempts.remove(key("login", clientId, email));
    }

    public void consumePasswordRequest(String action, String clientId, String email) {
        String key = key(action, clientId, email);
        check(key, passwordMaxAttempts, Duration.ofMinutes(passwordWindowMinutes));
        registerFailure(key, Duration.ofMinutes(passwordWindowMinutes));
    }

    private void check(String key, int maxAttempts, Duration window) {
        long now = System.currentTimeMillis();
        attempts.entrySet().removeIf(entry -> entry.getValue().expiresAt <= now);
        AttemptWindow current = attempts.get(key);
        if (current == null || current.expiresAt <= now) {
            attempts.remove(key);
            return;
        }
        if (current.count >= maxAttempts) {
            long retryAfterSeconds = Math.max(1, (current.expiresAt - now + 999) / 1000);
            throw new ResponseStatusException(
                HttpStatus.TOO_MANY_REQUESTS,
                "Demasiados intentos. Vuelva a intentarlo en " + retryAfterSeconds + " segundos"
            );
        }
    }

    private void registerFailure(String key, Duration window) {
        long now = System.currentTimeMillis();
        attempts.compute(key, (ignored, current) -> {
            if (current == null || current.expiresAt <= now) {
                return new AttemptWindow(1, now + window.toMillis());
            }
            return new AttemptWindow(current.count + 1, current.expiresAt);
        });
    }

    private String key(String action, String clientId, String email) {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
        return action + ":" + clientId + ":" + normalizedEmail;
    }

    private record AttemptWindow(int count, long expiresAt) {
    }
}
