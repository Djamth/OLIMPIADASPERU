package com.sistema.olimpiadas_peru.reporte.service;

import com.sistema.olimpiadas_peru.categoria.entity.CategoriaEvento;
import com.sistema.olimpiadas_peru.categoria.repository.CategoriaEventoRepository;
import com.sistema.olimpiadas_peru.equipo.repository.EquipoRepository;
import com.sistema.olimpiadas_peru.participante.repository.PlantillaEquipoRepository;
import com.sistema.olimpiadas_peru.reporte.dto.ReportePaisResponse;
import com.sistema.olimpiadas_peru.evento.service.EventoService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportePaisService {

    private final CategoriaEventoRepository categoriaRepository;
    private final EquipoRepository equipoRepository;
    private final PlantillaEquipoRepository plantillaRepository;
    private final EventoService eventoService;

    public List<ReportePaisResponse> generar(Long eventoId) {
        eventoService.getEntity(eventoId);
        return categoriaRepository.findByEventoIdOrderByNombreAsc(eventoId).stream()
                .map(this::toResponse)
                .toList();
    }

    private ReportePaisResponse toResponse(CategoriaEvento categoria) {
        var equipos = equipoRepository.findByCategoriaEventoIdOrderByDeporteNombreAsc(categoria.getId()).stream()
                .map(equipo -> new ReportePaisResponse.EquipoPaisResponse(
                        equipo.getId(),
                        equipo.getNombre(),
                        equipo.getDeporte() == null ? "Sin deporte" : equipo.getDeporte().getNombre(),
                        plantillaRepository.findByEquipoIdOrderByParticipanteApellidosAscParticipanteNombresAsc(
                                        equipo.getId()).stream()
                                .map(plantilla -> new ReportePaisResponse.ParticipantePaisResponse(
                                        plantilla.getParticipante().getId(),
                                        plantilla.getParticipante().getNombres() + " "
                                                + plantilla.getParticipante().getApellidos(),
                                        plantilla.getParticipante().getNumeroDocumento(),
                                        plantilla.getRol().name(),
                                        plantilla.getNumeroCamiseta()))
                                .toList()))
                .toList();
        return new ReportePaisResponse(
                categoria.getPais().getId(),
                categoria.getPais().getNombre(),
                categoria.getPais().getBandera(),
                categoria.getNombre(),
                categoria.getEvento().getInstitucion().getNombre(),
                equipos);
    }
}
