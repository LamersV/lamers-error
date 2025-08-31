/**
 * Normaliza mensagens de erro para exibição e logs.
 *
 * Regras aplicadas:
 * - Se message for null/undefined → retorna string padrão "Erro desconhecido".
 * - Converte qualquer valor (string, número, objeto, etc.) para string com String().
 * - Remove espaços no início/fim com trim().
 * - Colapsa múltiplos espaços em um único espaço.
 * - Usa normalização Unicode NFC (Canonical Composition) para garantir que caracteres acentuados
 *   fiquem em forma composta (ex.: "é" em vez de "é" com acento separado).
 *
 * Isso garante consistência entre mensagens, facilitando logs, testes e exibição.
 */
export function normalizeErrorMessage(message: unknown): string {
  if (message === null || message === undefined) return "Erro desconhecido";

  const str = String(message);

  return str
    .trim()
    .replace(/\s+/g, " ")
    .normalize("NFC");
}
