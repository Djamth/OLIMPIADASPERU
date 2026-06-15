package com.sistema.olimpiadas_peru.pais.service;

import com.sistema.olimpiadas_peru.categoria.repository.CategoriaEventoRepository;
import com.sistema.olimpiadas_peru.common.exception.BusinessException;
import com.sistema.olimpiadas_peru.common.exception.ResourceNotFoundException;
import com.sistema.olimpiadas_peru.pais.dto.PaisRequest;
import com.sistema.olimpiadas_peru.pais.dto.PaisResponse;
import com.sistema.olimpiadas_peru.pais.entity.Pais;
import com.sistema.olimpiadas_peru.pais.repository.PaisRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaisService {

    private final PaisRepository repository;
    private final CategoriaEventoRepository categoriaRepository;

    public List<PaisResponse> findAll() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public PaisResponse create(PaisRequest request) {
        Pais pais = new Pais();
        apply(pais, request);
        return toResponse(repository.save(pais));
    }

    @Transactional
    public PaisResponse update(Long id, PaisRequest request) {
        Pais pais = getEntity(id);
        apply(pais, request);
        return toResponse(repository.save(pais));
    }

    @Transactional
    public void delete(Long id) {
        Pais pais = getEntity(id);
        if (categoriaRepository.existsByPaisId(id)) {
            throw new BusinessException("El pais esta asignado a una categoria. Desactivalo en lugar de eliminarlo");
        }
        repository.delete(pais);
    }

    public Pais getEntity(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pais no encontrado con id " + id));
    }

    public List<Pais> findActivos() {
        return repository.findByActivoTrueOrderByNombreAsc();
    }

    private void apply(Pais pais, PaisRequest request) {
        String nombre = request.nombre().trim();
        String codigo = request.codigo().trim().toUpperCase();
        String bandera = request.bandera().trim().toLowerCase();
        String colorPrimario = request.colorPrimario().trim().toUpperCase();
        String colorSecundario = request.colorSecundario().trim().toUpperCase();
        if (!codigo.matches("[A-Z]{3}")) {
            throw new BusinessException("El codigo del pais debe usar ISO 3166-1 alfa-3, por ejemplo PER");
        }
        if (!bandera.matches("[a-z]{2}")) {
            throw new BusinessException("La bandera debe usar ISO 3166-1 alfa-2, por ejemplo pe");
        }
        if (!colorPrimario.matches("#[0-9A-F]{6}") || !colorSecundario.matches("#[0-9A-F]{6}")) {
            throw new BusinessException("Los colores deben tener formato hexadecimal, por ejemplo #D91023");
        }
        repository.findByNombreIgnoreCase(nombre)
                .filter(existing -> !existing.getId().equals(pais.getId()))
                .ifPresent(existing -> {
                    throw new BusinessException("Ya existe un pais con ese nombre");
                });
        repository.findByCodigoIgnoreCase(codigo)
                .filter(existing -> !existing.getId().equals(pais.getId()))
                .ifPresent(existing -> {
                    throw new BusinessException("Ya existe un pais con ese codigo");
                });
        pais.setNombre(nombre);
        pais.setCodigo(codigo);
        pais.setBandera(bandera);
        pais.setColorPrimario(colorPrimario);
        pais.setColorSecundario(colorSecundario);
        pais.setDatoCultural(request.datoCultural());
        pais.setActivo(request.activo());
    }

    public PaisResponse toResponse(Pais pais) {
        return new PaisResponse(pais.getId(), pais.getNombre(), pais.getCodigo(), pais.getBandera(),
                pais.getColorPrimario(), pais.getColorSecundario(), pais.getDatoCultural(), pais.isActivo());
    }
}
