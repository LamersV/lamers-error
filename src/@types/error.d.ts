/**
 * Extensão global da interface Error do TypeScript.
 *
 * O objetivo é alinhar a tipagem nativa de `Error` (que por padrão só tem `name`, `message` e `stack`)
 * com os campos adicionais usados no pacote de erros customizados (CustomError).
 *
 * Assim, quando você acessar `err.code`, `err.status`, etc. em blocos try/catch,
 * o TypeScript não reclama mais que essas propriedades "não existem" na interface padrão.
 */

declare global {
  interface Error {
    name: string;
    message: string;

    stack?: string;
    cause?: unknown;

    code?: string;
    type?: string;
    status?: number;
    userMessage?: string;
  }
}

export { }
