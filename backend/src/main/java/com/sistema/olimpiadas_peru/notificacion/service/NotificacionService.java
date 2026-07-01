package com.sistema.olimpiadas_peru.notificacion.service;

import com.sistema.olimpiadas_peru.auth1.repository.UsuarioRepository;
import com.sistema.olimpiadas_peru.notificacion.dto.NotificacionResponse;
import com.sistema.olimpiadas_peru.notificacion.dto.NotificacionResumenResponse;
import com.sistema.olimpiadas_peru.notificacion.entity.Notificacion;
import com.sistema.olimpiadas_peru.notificacion.repository.NotificacionRepository;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public void crearParaDestinatarios(
        Collection<String> destinatarios,
        Notificacion.Tipo tipo,
        String titulo,
        String mensaje,
        String referencia
    ) {
        Set<String> emails = new LinkedHashSet<>();
        agregar(emails, destinatarios);
        agregar(emails, usuarioRepository.findActiveEmailsByRolNombre("administrador"));

        emails.forEach(email -> notificacionRepository.save(Notificacion.builder()
            .destinatarioEmail(email)
            .tipo(tipo)
            .titulo(titulo)
            .mensaje(mensaje)
            .referencia(referencia)
            .leido(false)
            .build()));
    }

    public NotificacionResumenResponse resumen(String destinatarioEmail) {
        return new NotificacionResumenResponse(
            notificacionRepository.countByDestinatarioEmailIgnoreCaseAndLeidoFalse(destinatarioEmail),
            notificacionRepository.findTop10ByDestinatarioEmailIgnoreCaseOrderByCreadoEnDesc(destinatarioEmail)
                .stream()
                .map(this::mapear)
                .toList()
        );
    }

    public NotificacionResumenResponse listar(String destinatarioEmail, String tipo, String estado) {
        List<NotificacionResponse> items = notificacionRepository
            .findByDestinatarioEmailIgnoreCaseOrderByCreadoEnDesc(destinatarioEmail)
            .stream()
            .filter(item -> tipo == null || tipo.isBlank() || item.getTipo().name().equalsIgnoreCase(tipo))
            .filter(item -> {
                if (estado == null || estado.isBlank() || "TODAS".equalsIgnoreCase(estado)) {
                    return true;
                }
                if ("NO_LEIDAS".equalsIgnoreCase(estado)) {
                    return !item.isLeido();
                }
                if ("LEIDAS".equalsIgnoreCase(estado)) {
                    return item.isLeido();
                }
                return true;
            })
            .map(this::mapear)
            .toList();

        return new NotificacionResumenResponse(
            notificacionRepository.countByDestinatarioEmailIgnoreCaseAndLeidoFalse(destinatarioEmail),
            items
        );
    }

    @Transactional
    public void marcarComoLeida(Long id, String destinatarioEmail) {
        notificacionRepository.findById(id)
            .filter(item -> item.getDestinatarioEmail().equalsIgnoreCase(destinatarioEmail))
            .ifPresent(item -> {
                item.setLeido(true);
                item.setLeidoEn(LocalDateTime.now());
            });
    }

    @Transactional
    public void marcarTodasComoLeidas(String destinatarioEmail) {
        notificacionRepository.findByDestinatarioEmailIgnoreCaseAndLeidoFalse(destinatarioEmail)
            .forEach(item -> {
                item.setLeido(true);
                item.setLeidoEn(LocalDateTime.now());
            });
    }

    private void agregar(Set<String> emails, Collection<String> destinatarios) {
        if (destinatarios == null) {
            return;
        }

        destinatarios.stream()
            .filter(email -> email != null && !email.isBlank())
            .map(email -> email.trim().toLowerCase(Locale.ROOT))
            .forEach(emails::add);
    }

    private NotificacionResponse mapear(Notificacion item) {
        return new NotificacionResponse(
            item.getId(),
            item.getTipo().name(),
            item.getTitulo(),
            item.getMensaje(),
            item.getReferencia(),
            item.isLeido(),
            item.getCreadoEn()
        );
    }
}
