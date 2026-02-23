package br.com.ignshipping.controller.portal;

import br.com.ignshipping.domain.entity.Usuario;
import br.com.ignshipping.dto.portal.MeusPedidosResponse;
import br.com.ignshipping.dto.portal.PedidoCompradorResponse;
import br.com.ignshipping.service.PortalCompradorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/portal")
@PreAuthorize("hasRole('COMPRADOR')")
@RequiredArgsConstructor
public class PortalCompradorController {

    private final PortalCompradorService portalCompradorService;

    @GetMapping("/meus-pedidos")
    public ResponseEntity<MeusPedidosResponse> getMeusPedidos(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(portalCompradorService.getMeusPedidos(usuario.getId()));
    }

    @GetMapping("/meus-pedidos/{itemId}")
    public ResponseEntity<PedidoCompradorResponse> getDetalhePedido(
            @PathVariable Long itemId,
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(portalCompradorService.getDetalhePedido(itemId, usuario.getId()));
    }
}

