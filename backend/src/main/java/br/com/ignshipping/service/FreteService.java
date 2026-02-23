package br.com.ignshipping.service;

import br.com.ignshipping.domain.entity.FaixaFrete;
import br.com.ignshipping.domain.entity.Tenant;
import br.com.ignshipping.dto.vendedor.CalcularFreteRequest;
import br.com.ignshipping.dto.vendedor.CalcularFreteResponse;
import br.com.ignshipping.dto.vendedor.FaixaFreteRequest;
import br.com.ignshipping.dto.vendedor.FaixaFreteResponse;
import br.com.ignshipping.exception.BusinessException;
import br.com.ignshipping.exception.ResourceNotFoundException;
import br.com.ignshipping.repository.FaixaFreteRepository;
import br.com.ignshipping.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FreteService {

    private final FaixaFreteRepository faixaFreteRepository;
    private final TenantRepository tenantRepository;

    public List<FaixaFreteResponse> listarFaixas(Long tenantId) {
        return faixaFreteRepository.findAllByTenantIdOrderByTipoEnvioAscPesoMinGramasAsc(tenantId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public FaixaFreteResponse criarFaixa(FaixaFreteRequest request, Long tenantId) {
        if (request.pesoMinGramas() >= request.pesoMaxGramas()) {
            throw new BusinessException("Peso mínimo deve ser menor que peso máximo");
        }

        boolean overlap = faixaFreteRepository.existsOverlapping(
                tenantId, request.tipoEnvio(), request.pesoMinGramas(), request.pesoMaxGramas());
        if (overlap) {
            throw new BusinessException("Já existe uma faixa de frete que sobrepõe este intervalo de peso para " + request.tipoEnvio());
        }

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant não encontrado: " + tenantId));

        FaixaFrete faixa = FaixaFrete.builder()
                .tenant(tenant)
                .tipoEnvio(request.tipoEnvio())
                .pesoMinGramas(request.pesoMinGramas())
                .pesoMaxGramas(request.pesoMaxGramas())
                .custoYuan(request.custoYuan())
                .build();

        faixa = faixaFreteRepository.save(faixa);
        return toResponse(faixa);
    }

    public CalcularFreteResponse calcularFrete(CalcularFreteRequest request, Long tenantId) {
        FaixaFrete faixa = faixaFreteRepository
                .findByTenantIdAndTipoEnvioAndPesoMinGramasLessThanEqualAndPesoMaxGramasGreaterThanEqual(
                        tenantId, request.tipoEnvio(), request.pesoGramas(), request.pesoGramas())
                .orElseThrow(() -> new BusinessException("Nenhuma faixa de frete cobre este peso"));

        return new CalcularFreteResponse(faixa.getCustoYuan(), toResponse(faixa));
    }

    private FaixaFreteResponse toResponse(FaixaFrete faixa) {
        return new FaixaFreteResponse(
                faixa.getId(),
                faixa.getTipoEnvio(),
                faixa.getPesoMinGramas(),
                faixa.getPesoMaxGramas(),
                faixa.getCustoYuan()
        );
    }
}

