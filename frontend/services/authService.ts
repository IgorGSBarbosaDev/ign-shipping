import api from '@/lib/api'
import type { components } from '@/src/types/api.generated'

// ── Request / Response aliases ──────────────────────────────────────────
export type LoginRequest = components['schemas']['LoginRequest']
export type LoginResponse = components['schemas']['LoginResponse']
export type CadastroVendedorRequest = components['schemas']['CadastroVendedorRequest']
export type CadastroCompradorRequest = components['schemas']['CadastroCompradorRequest']
export type RecuperarSenhaRequest = components['schemas']['RecuperarSenhaRequest']
export type RedefinirSenhaRequest = components['schemas']['RedefinirSenhaRequest']

// ── Service functions ───────────────────────────────────────────────────
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/auth/login', data)
  return res.data
}

export async function cadastrarVendedor(
  data: CadastroVendedorRequest
): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/auth/cadastro/vendedor', data)
  return res.data
}

export async function cadastrarComprador(
  data: CadastroCompradorRequest
): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/auth/cadastro/comprador', data)
  return res.data
}

export async function recuperarSenha(data: RecuperarSenhaRequest): Promise<void> {
  await api.post('/auth/recuperar-senha', data)
}

export async function redefinirSenha(data: RedefinirSenhaRequest): Promise<void> {
  await api.post('/auth/redefinir-senha', data)
}
