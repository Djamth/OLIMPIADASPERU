package com.sistema.olimpiadas_peru.auth1.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.Year;
import java.util.Arrays;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Pattern RESET_CODE_PATTERN = Pattern.compile("^\\d{6}$");

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void enviarCorreo(String destinatario, String asunto, String contenido) {
        try {
            MimeMessage mensaje = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(destinatario);
            helper.setSubject(asunto);
            helper.setText(contenido, construirHtml(asunto, contenido));
            javaMailSender.send(mensaje);
        } catch (MessagingException exception) {
            throw new RuntimeException("No se pudo preparar el correo electrónico", exception);
        }
    }

    private String construirHtml(String asunto, String contenido) {
        String preheader = resumen(contenido);
        String cuerpo = convertirContenido(contenido);
        String anio = String.valueOf(Year.now().getValue());

        return """
            <!doctype html>
            <html lang="es">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>%s</title>
            </head>
            <body style="margin:0;padding:0;background:#eef4fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
              <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">%s</div>
              <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background:#eef4fb;padding:32px 14px;">
                <tr>
                  <td align="center">
                    <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 26px 70px rgba(15,23,42,0.14);">
                      <tr>
                        <td style="background:#08172f;padding:0;">
                          <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background:linear-gradient(135deg,#08172f,#1565c0);">
                            <tr>
                              <td style="padding:30px 34px;">
                                <div style="display:inline-block;width:48px;height:48px;line-height:48px;text-align:center;border-radius:16px;background:#ffffff;color:#1565c0;font-weight:900;font-size:18px;">OP</div>
                                <div style="margin-top:18px;color:#b9d9ff;font-size:12px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;">Olimpiadas Perú</div>
                                <h1 style="margin:8px 0 0;color:#ffffff;font-size:28px;line-height:1.18;font-weight:900;">%s</h1>
                                <p style="margin:10px 0 0;color:#dbeafe;font-size:14px;line-height:1.6;">Sistema de gestión deportiva institucional</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:34px;">
                          <div style="border:1px solid #e2e8f0;border-radius:18px;background:#f8fafc;padding:24px;">
                            %s
                          </div>
                          <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="margin-top:22px;">
                            <tr>
                              <td style="border-radius:16px;background:#ecfdf5;padding:16px 18px;color:#047857;font-size:13px;line-height:1.55;font-weight:700;">
                                Este mensaje fue generado automáticamente por Olimpiadas Perú. Mantén esta información solo con personal autorizado.
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:22px 34px;background:#f8fafc;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;line-height:1.6;">
                          <strong style="color:#0f172a;">Olimpiadas Perú</strong><br/>
                          Gestión, rendimiento y excelencia deportiva.<br/>
                          © %s Olimpiadas Perú. Todos los derechos reservados.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """.formatted(escapar(asunto), escapar(preheader), escapar(asunto), cuerpo, anio);
    }

    private String convertirContenido(String contenido) {
        String[] lineas = contenido == null ? new String[0] : contenido.strip().split("\\R");

        return Arrays.stream(lineas)
            .map(String::trim)
            .filter(linea -> !linea.isBlank())
            .map(this::convertirLinea)
            .reduce("", String::concat);
    }

    private String convertirLinea(String linea) {
        if (RESET_CODE_PATTERN.matcher(linea).matches()) {
            return """
                <div style="margin:20px 0;padding:18px 22px;border-radius:16px;background:#ffffff;border:1px dashed #1565c0;text-align:center;">
                  <div style="color:#64748b;font-size:12px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;">Código de verificación</div>
                  <div style="margin-top:8px;color:#1565c0;font-size:34px;line-height:1;font-weight:900;letter-spacing:0.22em;">%s</div>
                </div>
                """.formatted(escapar(linea));
        }

        if (linea.contains(" vs ") || linea.matches(".*\\d+\\s*-\\s*\\d+.*")) {
            return """
                <div style="margin:14px 0;padding:16px 18px;border-radius:14px;background:#ffffff;border:1px solid #dbeafe;color:#0f172a;font-size:15px;line-height:1.6;font-weight:800;">
                  %s
                </div>
                """.formatted(escapar(linea));
        }

        return """
            <p style="margin:0 0 14px;color:#334155;font-size:15px;line-height:1.7;font-weight:600;">
              %s
            </p>
            """.formatted(escapar(linea));
    }

    private String resumen(String contenido) {
        if (contenido == null || contenido.isBlank()) {
            return "Tienes una nueva comunicación de Olimpiadas Perú.";
        }
        String resumen = contenido.strip().replaceAll("\\s+", " ");
        return resumen.substring(0, Math.min(140, resumen.length()));
    }

    private String escapar(String value) {
        if (value == null) {
            return "";
        }
        return value
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#39;");
    }
}
