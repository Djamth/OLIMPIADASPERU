package com.sistema.olimpiadas_peru.inscripcion.event;

import com.sistema.olimpiadas_peru.auth1.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class InscripcionNotificationListener {

    private final EmailService emailService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void enviarConfirmacion(InscripcionConfirmadaEvent event) {
        if (event.destinatario() == null || event.destinatario().isBlank()) {
            return;
        }

        String contenido = """
            Hola %s,

            La inscripcion del equipo %s en el deporte %s fue confirmada correctamente.

            Las fechas, sedes y próximos encuentros se publicarán en el portal de Olimpiadas Perú.
            """.formatted(event.institucion(), event.equipo(), event.deporte());

        try {
            emailService.enviarCorreo(
                event.destinatario(),
                "Inscripción confirmada - Olimpiadas Perú",
                contenido
            );
        } catch (RuntimeException exception) {
            log.error(
                "No se pudo enviar la confirmacion de inscripcion del equipo {} a {}",
                event.equipo(),
                event.destinatario(),
                exception
            );
        }
    }
}
