package com.sistema.olimpiadas_peru.reporte.dto;

public record ReporteArchivo(
    byte[] contenido,
    String nombreArchivo,
    String contentType
) {
}
