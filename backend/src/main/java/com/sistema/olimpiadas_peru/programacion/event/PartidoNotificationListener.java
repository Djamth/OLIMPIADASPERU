package com.sistema.olimpiadas_peru.programacion.event;

import com.sistema.olimpiadas_peru.auth1.service.EmailService;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashSet;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class PartidoNotificationListener {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final EmailService emailService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void enviarAviso(PartidoProgramadoEvent event) {
        Set<String> destinatarios = new LinkedHashSet<>();
        agregar(destinatarios, event.emailLocal());
        agregar(destinatarios, event.emailVisitante());
        if (destinatarios.isEmpty()) {
            return;
        }

        String asunto = event.reprogramado()
                ? "Partido reprogramado - Olimpiadas Perú"
                : "Nuevo partido programado - Olimpiadas Perú";
        String contenido = """
                Hola,

                Se %s el encuentro de %s:

                %s vs %s
                Fecha y hora: %s
                Sede: %s

                Revisa el portal público para consultar el fixture actualizado.
                """.formatted(
                event.reprogramado() ? "actualizó" : "programó",
                event.deporte(),
                event.equipoLocal(),
                event.equipoVisitante(),
                event.fechaHora().format(FORMATTER),
                event.sede());

        destinatarios.forEach(destinatario -> enviar(destinatario, asunto, contenido));
    }

    private void agregar(Set<String> destinatarios, String email) {
        if (email != null && !email.isBlank()) {
            destinatarios.add(email);
        }
    }

    private void enviar(String destinatario, String asunto, String contenido) {
        try {
            emailService.enviarCorreo(destinatario, asunto, contenido);
        } catch (RuntimeException exception) {
            log.error("No se pudo enviar aviso de partido a {}", destinatario, exception);
        }
    }
}
