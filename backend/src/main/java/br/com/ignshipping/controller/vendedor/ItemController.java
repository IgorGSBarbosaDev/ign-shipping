package br.com.ignshipping.controller.vendedor;

import br.com.ignshipping.dto.vendedor.ItensPorCompradorResponse;
import br.com.ignshipping.dto.vendedor.OrderItemRequest;
import br.com.ignshipping.dto.vendedor.OrderItemResponse;
import br.com.ignshipping.dto.vendedor.OrderItemUpdateRequest;
import br.com.ignshipping.security.TenantContext;
import br.com.ignshipping.service.OrderItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendedor/pacotes/{pacoteId}/itens")
@PreAuthorize("hasRole('VENDEDOR')")
@RequiredArgsConstructor
public class ItemController {

    private final OrderItemService orderItemService;

    @GetMapping
    public ResponseEntity<List<ItensPorCompradorResponse>> listar(@PathVariable Long pacoteId) {
        Long tenantId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(orderItemService.listarAgrupadosPorComprador(pacoteId, tenantId));
    }

    @PostMapping
    public ResponseEntity<OrderItemResponse> adicionar(@PathVariable Long pacoteId,
                                                        @Valid @RequestBody OrderItemRequest request) {
        Long tenantId = TenantContext.getCurrentTenant();
        OrderItemResponse response = orderItemService.adicionarItem(pacoteId, request, tenantId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<OrderItemResponse> atualizar(@PathVariable Long pacoteId,
                                                        @PathVariable Long itemId,
                                                        @Valid @RequestBody OrderItemUpdateRequest request) {
        Long tenantId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(orderItemService.atualizarItem(pacoteId, itemId, request, tenantId));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> remover(@PathVariable Long pacoteId,
                                         @PathVariable Long itemId) {
        Long tenantId = TenantContext.getCurrentTenant();
        orderItemService.removerItem(pacoteId, itemId, tenantId);
        return ResponseEntity.noContent().build();
    }
}

