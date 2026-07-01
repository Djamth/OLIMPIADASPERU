package com.sistema.olimpiadas_peru.inscripcion;

import com.sistema.olimpiadas_peru.auth1.service.EmailService;
import com.sistema.olimpiadas_peru.inscripcion.event.InscripcionConfirmadaEvent;
import com.sistema.olimpiadas_peru.inscripcion.event.InscripcionNotificationListener;
import com.sistema.olimpiadas_peru.notificacion.service.NotificacionService;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class InscripcionNotificationListenerTests {

    @Test
    void shouldSendConfirmationEmailAndCreateInternalNotification() {
        EmailService emailService = mock(EmailService.class);
        NotificacionService notificacionService = mock(NotificacionService.class);
        InscripcionNotificationListener listener = new InscripcionNotificationListener(emailService, notificacionService);

        listener.enviarConfirmacion(new InscripcionConfirmadaEvent(
            "coordinacion@colegio.pe",
            "Colegio Demo",
            "Brasil 1A",
            "Futbol"
        ));

        verify(emailService).enviarCorreo(
            eq("coordinacion@colegio.pe"),
            eq("Inscripción confirmada - Olimpiadas Perú"),
            contains("Brasil 1A")
        );
        verify(notificacionService).crearParaDestinatarios(
            any(),
            any(),
            eq("Inscripción confirmada"),
            contains("Brasil 1A"),
            eq("/inscripciones")
        );
    }

    @Test
    void shouldNotFailBusinessFlowWhenEmailProviderIsUnavailable() {
        EmailService emailService = mock(EmailService.class);
        NotificacionService notificacionService = mock(NotificacionService.class);
        doThrow(new RuntimeException("SMTP no disponible"))
            .when(emailService)
            .enviarCorreo(eq("coordinacion@colegio.pe"), eq("Inscripción confirmada - Olimpiadas Perú"), contains("Brasil 1A"));

        InscripcionNotificationListener listener = new InscripcionNotificationListener(emailService, notificacionService);

        assertThatCode(() -> listener.enviarConfirmacion(new InscripcionConfirmadaEvent(
            "coordinacion@colegio.pe",
            "Colegio Demo",
            "Brasil 1A",
            "Futbol"
        ))).doesNotThrowAnyException();
    }
}
