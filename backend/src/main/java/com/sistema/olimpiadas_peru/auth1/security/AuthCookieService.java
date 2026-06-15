package com.sistema.olimpiadas_peru.auth1.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import java.util.Arrays;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthCookieService {

    public static final String ACCESS_COOKIE = "op_access_token";
    public static final String REFRESH_COOKIE = "op_refresh_token";

    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.auth.cookie.secure:false}")
    private boolean secure;

    @Value("${app.auth.cookie.same-site:Strict}")
    private String sameSite;

    @Value("${app.auth.cookie.path:/}")
    private String path;

    public void writeSession(HttpServletResponse response, String accessToken, String refreshToken) {
        addCookie(response, ACCESS_COOKIE, accessToken, jwtTokenProvider.getAccessTokenExpirationMs());
        addCookie(response, REFRESH_COOKIE, refreshToken, jwtTokenProvider.getRefreshTokenExpirationMs());
    }

    public void clearSession(HttpServletResponse response) {
        expireCookie(response, ACCESS_COOKIE);
        expireCookie(response, REFRESH_COOKIE);
    }

    public String getAccessToken(HttpServletRequest request) {
        return getCookieValue(request, ACCESS_COOKIE);
    }

    public String getRefreshToken(HttpServletRequest request) {
        return getCookieValue(request, REFRESH_COOKIE);
    }

    private String getCookieValue(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        return Arrays.stream(cookies)
            .filter(cookie -> name.equals(cookie.getName()))
            .map(Cookie::getValue)
            .findFirst()
            .orElse(null);
    }

    private void addCookie(HttpServletResponse response, String name, String value, long expirationMs) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
            .httpOnly(true)
            .secure(secure)
            .sameSite(sameSite)
            .path(path)
            .maxAge(Duration.ofMillis(expirationMs))
            .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void expireCookie(HttpServletResponse response, String name) {
        ResponseCookie cookie = ResponseCookie.from(name, "")
            .httpOnly(true)
            .secure(secure)
            .sameSite(sameSite)
            .path(path)
            .maxAge(Duration.ZERO)
            .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
