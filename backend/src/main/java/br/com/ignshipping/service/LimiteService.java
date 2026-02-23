package br.com.ignshipping.service;

import br.com.ignshipping.domain.entity.Tenant;
import br.com.ignshipping.dto.vendedor.UsoPlanoPorcentagem;
import br.com.ignshipping.exception.LimitePlanoExcedidoException;
import br.com.ignshipping.exception.ResourceNotFoundException;
import br.com.ignshipping.repository.CompradorRepository;
import br.com.ignshipping.repository.PacoteRepository;
import br.com.ignshipping.repository.ProdutoRepository;
import br.com.ignshipping.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.YearMonth;

@Service
@RequiredArgsConstructor
public class LimiteService {

    private final TenantRepository tenantRepository;
    private final CompradorRepository compradorRepository;
    private final ProdutoRepository produtoRepository;
    private final PacoteRepository pacoteRepository;

    public void verificarLimiteCompradores(Long tenantId) {
        Tenant tenant = buscarTenant(tenantId);
        Integer limite = tenant.getPlano().getMaxCompradores();
        if (limite == null) return; // ilimitado
        long atual = compradorRepository.countByTenantId(tenantId);
        if (atual >= limite) {
            throw new LimitePlanoExcedidoException(
                    "Limite de compradores atingido para o plano " + tenant.getPlano().getNome());
        }
    }

    public void verificarLimiteProdutos(Long tenantId) {
        Tenant tenant = buscarTenant(tenantId);
        Integer limite = tenant.getPlano().getMaxProdutos();
        if (limite == null) return;
        long atual = produtoRepository.countByTenantId(tenantId);
        if (atual >= limite) {
            throw new LimitePlanoExcedidoException(
                    "Limite de produtos atingido para o plano " + tenant.getPlano().getNome());
        }
    }

    public void verificarLimitePacotesMes(Long tenantId) {
        Tenant tenant = buscarTenant(tenantId);
        Integer limite = tenant.getPlano().getMaxPacotesMes();
        if (limite == null) return;

        YearMonth mesAtual = YearMonth.now();
        LocalDateTime inicio = mesAtual.atDay(1).atStartOfDay();
        LocalDateTime fim = mesAtual.atEndOfMonth().atTime(23, 59, 59);
        long atual = pacoteRepository.countByTenantIdAndCriadoEmBetween(tenantId, inicio, fim);

        if (atual >= limite) {
            throw new LimitePlanoExcedidoException(
                    "Limite de pacotes no mês atingido para o plano " + tenant.getPlano().getNome());
        }
    }

    public UsoPlanoPorcentagem getUsoAtual(Long tenantId) {
        Tenant tenant = buscarTenant(tenantId);

        long compradores = compradorRepository.countByTenantId(tenantId);
        long produtos = produtoRepository.countByTenantId(tenantId);

        YearMonth mesAtual = YearMonth.now();
        LocalDateTime inicio = mesAtual.atDay(1).atStartOfDay();
        LocalDateTime fim = mesAtual.atEndOfMonth().atTime(23, 59, 59);
        long pacotesMes = pacoteRepository.countByTenantIdAndCriadoEmBetween(tenantId, inicio, fim);

        return new UsoPlanoPorcentagem(
                pacotesMes,
                tenant.getPlano().getMaxPacotesMes(),
                compradores,
                tenant.getPlano().getMaxCompradores(),
                produtos,
                tenant.getPlano().getMaxProdutos()
        );
    }

    private Tenant buscarTenant(Long tenantId) {
        return tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant não encontrado: " + tenantId));
    }
}

