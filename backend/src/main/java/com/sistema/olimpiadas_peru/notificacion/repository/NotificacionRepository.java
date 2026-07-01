package com.sistema.olimpiadas_peru.notificacion.repository;

import com.sistema.olimpiadas_peru.notificacion.entity.Notificacion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    List<Notificacion> findTop10ByDestinatarioEmailIgnoreCaseOrderByCreadoEnDesc(String destinatarioEmail);
    long countByDestinatarioEmailIgnoreCaseAndLeidoFalse(String destinatarioEmail);
    List<Notificacion> findByDestinatarioEmailIgnoreCaseAndLeidoFalse(String destinatarioEmail);
}
