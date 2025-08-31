import type { CustomErrorCode, CustomErrorProperties, CustomErrorType } from "../types";
import { normalizeErrorMessage } from "../utils/normalize";

/**
 * Classe base de erro customizado para todo o pacote.
 - Estende Error e adiciona informações estruturadas (code, type, status, userMessage, data, cause).
 */
export class CustomError extends Error {
  public readonly code: CustomErrorCode;
  public readonly type: CustomErrorType;
  public readonly status: number;
  public readonly userMessage: string;
  public readonly data?: Record<string, any>;
  public readonly cause?: unknown;

  constructor(message: string, properties?: CustomErrorProperties & { cause?: unknown }) {
    const normalizedMessage = normalizeErrorMessage(message);

    super(normalizedMessage, properties?.cause ? { cause: properties.cause } : undefined);

    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = this.constructor.name;
    this.code = properties?.code ?? "ERROR";
    this.type = properties?.type ?? "error";
    this.status = properties?.status ?? 500;
    this.userMessage = properties?.userMessage ?? normalizedMessage;
    this.data = properties?.data;
    this.cause = properties?.cause;
  }

  /**
   * Retorna uma representação string simples do erro.
   * Ex.: "CustomError [ERROR]: Falha geral".
   */
  toString(): string {
    return `${this.name} [${this.code}]: ${this.message}`;
  }

  /**
   * Serializa o erro em um objeto pronto para JSON.stringify.
   * Inclui stack trace, dados adicionais e causa (se houver).
   */
  toJSON(): Record<string, unknown> {
    const base: Record<string, unknown> = {
      name: this.name,
      code: this.code,
      type: this.type,
      status: this.status,
      message: this.message,
      userMessage: this.userMessage,
      data: this.data,
      stack: this.stack,
    };

    if (this.cause instanceof Error) {
      base.cause = {
        name: this.cause.name,
        message: this.cause.message,
        code: (this.cause as any)?.code,
        stack: this.cause.stack,
      };
    }
    else if (this.cause !== undefined) {
      base.cause = this.cause;
    }

    return base;
  }

  /**
   * Type guard: verifica se um valor é uma instância de CustomError.
   * Útil em blocos try/catch para narrow types.
   */
  static is(err: unknown): err is CustomError {
    return (
      (!!err && typeof err === "object" && (err as any).name === "CustomError") ||
      err instanceof CustomError
    );
  }

  /**
   * Factory estática para embrulhar qualquer erro desconhecido em um CustomError.
   * - Se já for CustomError, retorna o mesmo.
   * - Se for Error nativo, cria um CustomError preservando mensagem, stack e causa.
   * - Se for valor arbitrário (string, objeto, número...), cria um erro genérico.
   */
  static from(err: unknown, override?: Partial<CustomErrorProperties> & { cause?: unknown }): CustomError {
    if (err instanceof CustomError) return err;

    if (err instanceof Error) {
      return new CustomError(err.message || "Erro desconhecido", {
        code: override?.code ?? "SYSTEM_ERROR",
        type: override?.type ?? "error",
        status: override?.status ?? 500,
        data: override?.data,
        userMessage: override?.userMessage ?? err.message,
        cause: override?.cause ?? err,
      });
    }

    return new CustomError("Erro desconhecido", {
      code: override?.code ?? "SYSTEM_ERROR",
      type: override?.type ?? "error",
      status: override?.status ?? 500,
      data: override?.data ?? { error: err },
      userMessage: override?.userMessage ?? "Erro desconhecido",
      cause: override?.cause,
    });
  }
}
