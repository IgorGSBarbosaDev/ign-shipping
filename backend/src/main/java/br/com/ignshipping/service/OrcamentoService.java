package br.com.ignshipping.service;

import br.com.ignshipping.domain.entity.Orcamento;
import br.com.ignshipping.domain.entity.Tenant;
import br.com.ignshipping.dto.vendedor.OrcamentoRequest;
import br.com.ignshipping.dto.vendedor.OrcamentoResponse;
import br.com.ignshipping.dto.vendedor.OrcamentoResultadoResponse;
import br.com.ignshipping.exception.ResourceNotFoundException;
import br.com.ignshipping.repository.OrcamentoRepository;
import br.com.ignshipping.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrcamentoService {

    private final OrcamentoRepository orcamentoRepository;
    private final TenantRepository tenantRepository;

    public List<OrcamentoResponse> listar(Long tenantId) {
        return orcamentoRepository.findAllByTenantIdOrderByCriadoEmDesc(tenantId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public OrcamentoResultadoResponse simular(OrcamentoRequest request) {
        return calcular(request);
    }

    @Transactional
    public OrcamentoResponse salvar(OrcamentoRequest request, Long tenantId) {
        OrcamentoResultadoResponse resultado = calcular(request);

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant não encontrado: " + tenantId));

        Orcamento orcamento = Orcamento.builder()
                .tenant(tenant)
                .nomeProduto(request.nomeProduto())
                .categoria(request.categoria())
                .custoYuan(request.custoYuan())
                .freteVendedorYuan(defaultZero(request.freteVendedorYuan()))
                .freteInternacionalYuan(defaultZero(request.freteInternacionalYuan()))
                .taxaCssbuyYuan(defaultZero(request.taxaCssbuyYuan()))
                .taxaAlfandegariaBrl(defaultZero(request.taxaAlfandegariaBrl()))
                .pesoGramas(request.pesoGramas())
                .cambio(request.cambio())
                .precoVendaBrl(request.precoVendaBrl())
                .custoTotalBrl(resultado.custoTotalBrl())
                .lucroBrl(resultado.lucroBrl())
                .margemPercentual(resultado.margemPercentual())
                .build();

        orcamento = orcamentoRepository.save(orcamento);
        return toResponse(orcamento, resultado);
    }

    // ── Cálculo ────────────────────────────────────────────────

    private OrcamentoResultadoResponse calcular(OrcamentoRequest req) {
        BigDecimal cambio = req.cambio();
        BigDecimal custoYuan = req.custoYuan();
        BigDecimal freteVendedorYuan = defaultZero(req.freteVendedorYuan());
        BigDecimal freteInternYuan = defaultZero(req.freteInternacionalYuan());
        BigDecimal taxaCssbuyYuan = defaultZero(req.taxaCssbuyYuan());
        BigDecimal taxaAlfandBrl = defaultZero(req.taxaAlfandegariaBrl());

        BigDecimal custoProdutoBrl = converterYuanParaBrl(custoYuan, cambio);
        BigDecimal custoFreteVendBrl = converterYuanParaBrl(freteVendedorYuan, cambio);
        BigDecimal custoFreteInternBrl = converterYuanParaBrl(freteInternYuan, cambio);
        BigDecimal custoCssbuyBrl = converterYuanParaBrl(taxaCssbuyYuan, cambio);

        BigDecimal custoTotalBrl = custoProdutoBrl
                .add(custoFreteVendBrl)
                .add(custoFreteInternBrl)
                .add(custoCssbuyBrl)
                .add(taxaAlfandBrl)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal precoVenda = req.precoVendaBrl();
        BigDecimal lucro;
        BigDecimal margem;

        if (precoVenda != null && precoVenda.compareTo(BigDecimal.ZERO) > 0) {
            lucro = precoVenda.subtract(custoTotalBrl).setScale(2, RoundingMode.HALF_UP);
            margem = lucro.multiply(BigDecimal.valueOf(100))
                    .divide(precoVenda, 2, RoundingMode.HALF_UP);
        } else {
            precoVenda = null;
            lucro = BigDecimal.ZERO;
            margem = BigDecimal.ZERO;
        }

        // Preço sugerido: custoTotal / (1 - margem%)
        BigDecimal precoSug20 = custoTotalBrl
                .divide(new BigDecimal("0.80"), 2, RoundingMode.HALF_UP);
        BigDecimal precoSug30 = custoTotalBrl
                .divide(new BigDecimal("0.70"), 2, RoundingMode.HALF_UP);

        return new OrcamentoResultadoResponse(
                custoProdutoBrl, custoFreteVendBrl, custoFreteInternBrl, custoCssbuyBrl,
                taxaAlfandBrl, custoTotalBrl, precoVenda, lucro, margem,
                precoSug20, precoSug30
        );
    }

    // ── Helpers ────────────────────────────────────────────────

    private BigDecimal defaultZero(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

        private BigDecimal converterYuanParaBrl(BigDecimal valorYuan, BigDecimal cambioBrlParaYuan) {
                if (valorYuan == null || valorYuan.compareTo(BigDecimal.ZERO) == 0) {
                        return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
                }

                BigDecimal cambioSeguro = (cambioBrlParaYuan == null || cambioBrlParaYuan.compareTo(BigDecimal.ZERO) <= 0)
                                ? BigDecimal.ONE : cambioBrlParaYuan;

                return valorYuan.divide(cambioSeguro, 2, RoundingMode.HALF_UP);
        }

    private OrcamentoResponse toResponse(Orcamento o) {
        BigDecimal custoTotalBrl = o.getCustoTotalBrl() != null ? o.getCustoTotalBrl() : BigDecimal.ZERO;
        BigDecimal precoSug20 = custoTotalBrl.compareTo(BigDecimal.ZERO) > 0
                ? custoTotalBrl.divide(new BigDecimal("0.80"), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        BigDecimal precoSug30 = custoTotalBrl.compareTo(BigDecimal.ZERO) > 0
                ? custoTotalBrl.divide(new BigDecimal("0.70"), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        return new OrcamentoResponse(
                o.getId(), o.getCriadoEm(), o.getNomeProduto(), o.getCategoria(),
                o.getCustoYuan(), o.getFreteVendedorYuan(), o.getFreteInternacionalYuan(),
                o.getTaxaCssbuyYuan(), o.getTaxaAlfandegariaBrl(), o.getPesoGramas(),
                o.getCambio(), o.getPrecoVendaBrl(), o.getCustoTotalBrl(),
                o.getLucroBrl(), o.getMargemPercentual(), precoSug20, precoSug30
        );
    }

    private OrcamentoResponse toResponse(Orcamento o, OrcamentoResultadoResponse resultado) {
        return new OrcamentoResponse(
                o.getId(), o.getCriadoEm(), o.getNomeProduto(), o.getCategoria(),
                o.getCustoYuan(), o.getFreteVendedorYuan(), o.getFreteInternacionalYuan(),
                o.getTaxaCssbuyYuan(), o.getTaxaAlfandegariaBrl(), o.getPesoGramas(),
                o.getCambio(), o.getPrecoVendaBrl(), resultado.custoTotalBrl(),
                resultado.lucroBrl(), resultado.margemPercentual(),
                resultado.precoSugeridoMargem20(), resultado.precoSugeridoMargem30()
        );
    }
}

