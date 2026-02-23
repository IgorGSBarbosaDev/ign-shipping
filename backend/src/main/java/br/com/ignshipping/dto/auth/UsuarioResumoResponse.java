package br.com.ignshipping.dto.auth;

public record UsuarioResumoResponse(
        Long id,
        String nome,
        String email,
        String role,
        Long tenantId
) {
}

