package com.sistema.olimpiadas_peru.inscripcion;

import com.sistema.olimpiadas_peru.auth1.service.EmailService;
import com.sistema.olimpiadas_peru.inscripcion.event.InscripcionConfirmadaEvent;
import com.sistema.olimpiadas_peru.inscripcion.event.InscripcionNotificationListener;
import org.junit.jupiter.api.Test;

import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.assertj.core.api.Assertions.assertThatCode;

class InscripcionNotificationListenerTests {

    @Test
    void shouldSendConfirmationEmail() {
        EmailService emailService = mock(EmailService.class);
        InscripcionNotificationListener listener = new InscripcionNotificationListener(emailService);

        listener.enviarConfirmacion(new InscripcionConfirmadaEvent(
            "coordinacion@colegio.pe",
            "Colegio Demo",
            "Brasil 1A",
            "Futbol"
        ));

        verify(emailService).enviarCorreo(
            eq("coordinacion@colegio.pe"),
            eq("Inscripcion confirmada - Olimpiadas Peru"),
            contains("Brasil 1A")
        );
    }

    @Test
    void shouldNotFailBusinessFlowWhenEmailProviderIsUnavailable() {
        EmailService emailService = mock(EmailService.class);
        doThrow(new RuntimeException("SMTP no disponible"))
            .when(emailService)
            .enviarCorreo(eq("coordinacion@colegio.pe"), eq("Inscripcion confirmada - Olimpiadas Peru"), contains("Brasil 1A"));

        InscripcionNotificationListener listener = new InscripcionNotificationListener(emailService);

        assertThatCode(() -> listener.enviarConfirmacion(new InscripcionConfirmadaEvent(
            "coordinacion@colegio.pe",
            "Colegio Demo",
            "Brasil 1A",
            "Futbol"
        ))).doesNotThrowAnyException();
    }
}
