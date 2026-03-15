import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata valor em BRL (Real brasileiro)
 * Ex: 1234.5 → "R$ 1.234,50"
 */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Formata valor em CNY (Yuan chinês)
 * Ex: 1234.5 → "¥ 1.234,50"
 */
export function formatYuan(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'CNY',
  }).format(value)
}

/**
 * Formata porcentagem no padrão brasileiro
 * Ex: 0.1542 → "15,42%"
 */
export function formatPercent(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Formata data no padrão brasileiro
 * Ex: "2026-02-23" → "23/02/2026"
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

/**
 * Formata data e hora no padrão brasileiro
 * Ex: "2026-02-23T14:30:00" → "23/02/2026 14:30"
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function converterYuanParaBrl(valorYuan: number, cambio: number): number {
  const valorSeguro = Number.isFinite(valorYuan) ? valorYuan : 0
  const cambioSeguro = Number.isFinite(cambio) && cambio > 0 ? cambio : 1
  return valorSeguro / cambioSeguro
}

export function calcularCustoEstimadoProdutoBrl(
  custoCompraYuan: number,
  freteVendedorYuan: number,
  cambio: number,
): number {
  const custoCompra = Number.isFinite(custoCompraYuan) ? custoCompraYuan : 0
  const frete = Number.isFinite(freteVendedorYuan) ? freteVendedorYuan : 0
  return converterYuanParaBrl(custoCompra + frete, cambio)
}
