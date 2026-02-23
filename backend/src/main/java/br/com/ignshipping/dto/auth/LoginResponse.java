package br.com.ignshipping.dto.auth;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        UsuarioResumoResponse usuario
) {
}

