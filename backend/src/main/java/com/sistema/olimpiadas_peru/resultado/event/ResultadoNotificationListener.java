package com.sistema.olimpiadas_peru.resultado.event;

import com.sistema.olimpiadas_peru.auth1.service.EmailService;
import com.sistema.olimpiadas_peru.notificacion.entity.Notificacion;
import com.sistema.olimpiadas_peru.notificacion.service.NotificacionService;
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
public class ResultadoNotificationListener {

    private final EmailService emailService;
    private final NotificacionService notificacionService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void enviarAviso(ResultadoRegistradoEvent event) {
        Set<String> destinatarios = new LinkedHashSet<>();
        agregar(destinatarios, event.emailLocal());
        agregar(destinatarios, event.emailVisitante());
        if (destinatarios.isEmpty()) {
            return;
        }

        String contenido = """
                Hola,

                Se registró el resultado del encuentro de %s:

                %s %d - %d %s

                El ranking y las estadísticas ya se encuentran actualizados.
                """.formatted(
                event.deporte(),
                event.equipoLocal(),
                event.puntajeLocal(),
                event.puntajeVisitante(),
                event.equipoVisitante());

        notificacionService.crearParaDestinatarios(
                destinatarios,
                Notificacion.Tipo.RESULTADO,
                "Resultado registrado",
                "%s %d - %d %s".formatted(
                        event.equipoLocal(),
                        event.puntajeLocal(),
                        event.puntajeVisitante(),
                        event.equipoVisitante()),
                "/resultados");

        destinatarios.forEach(destinatario -> enviar(destinatario, contenido));
    }

    private void agregar(Set<String> destinatarios, String email) {
        if (email != null && !email.isBlank()) {
            destinatarios.add(email);
        }
    }

    private void enviar(String destinatario, String contenido) {
        try {
            emailService.enviarCorreo(destinatario, "Resultado registrado - Olimpiadas Perú", contenido);
        } catch (RuntimeException exception) {
            log.error("No se pudo enviar aviso de resultado a {}", destinatario, exception);
        }
    }
}
