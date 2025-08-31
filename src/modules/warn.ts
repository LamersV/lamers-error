import type { CustomErrorPartialProperties, CustomErrorProperties } from "../types";
import { ExceptionError } from "./exception";
import { CustomError } from "./custom";

/**
 * WarnError
 * Base para erros de cliente (família 4xx).
 - Garante, em tempo de execução, que o status esteja no range 4xx.
 - Caso receba um status 5xx, redireciona a criação para ExceptionError (erro de servidor);
 - caso receba algo fora de 4xx/5xx, usa CustomError (fallback neutro).
 */
export class WarnError extends CustomError {
  constructor(message: string, properties?: CustomErrorProperties) {
    const status = properties?.status ?? 400;

    if (status < 400 || status > 499) {
      if (status > 499 && status < 600) {
        throw new ExceptionError(message, properties);
      }
      throw new CustomError(message, properties);
    }

    super(message, {
      ...properties,
      type: "warn",
      status,
      code: properties?.code ?? "WARN",
      userMessage: properties?.userMessage ?? message,
    });
  }

  /**
   * toHttp
   * Retorna shape pronto para resposta HTTP (Express/Fastify),
   * com status numérico e body padronizado.
   */
  toHttp() {
    const body = {
      code: this.code,
      type: this.type,
      message: this.userMessage ?? this.message,
      data: this.data ?? null,
    };

    return { status: this.status, body };
  }
}

/** 400 Bad Request — requisição inválida (sintaxe/parâmetros incorretos). */
export class BadRequestWarn extends WarnError {
  constructor(message?: string, properties?: CustomErrorPartialProperties) {
    const { data, userMessage } = properties ?? {};
    super(message ?? "Requisição inválida", {
      code: "BAD_REQUEST_WARN",
      status: 400,
      userMessage,
      data,
    });
  }
}

/** 401 Unauthorized — ausência ou falha de autenticação. */
export class UnauthorizedWarn extends WarnError {
  constructor(message?: string, properties?: CustomErrorPartialProperties) {
    const { data, userMessage } = properties ?? {};
    super(message ?? "Não autorizado", {
      code: "UNAUTHORIZED_WARN",
      status: 401,
      userMessage,
      data,
    });
  }
}

/** 403 Forbidden — credenciais válidas mas sem permissão de acesso. */
export class ForbiddenWarn extends WarnError {
  constructor(message?: string, properties?: CustomErrorPartialProperties) {
    const { data, userMessage } = properties ?? {};
    super(message ?? "Acesso negado", {
      code: "FORBIDDEN_WARN",
      status: 403,
      userMessage,
      data,
    });
  }
}

/** 404 Not Found — recurso solicitado não existe. */
export class NotFoundWarn extends WarnError {
  constructor(message?: string, properties?: CustomErrorPartialProperties) {
    const { data, userMessage } = properties ?? {};
    super(message ?? "Recurso não encontrado", {
      code: "NOT_FOUND_WARN",
      status: 404,
      userMessage,
      data,
    });
  }
}

/** 409 Conflict — conflito de estado, geralmente duplicidade. */
export class ConflictWarn extends WarnError {
  constructor(message?: string, properties?: CustomErrorPartialProperties) {
    const { data, userMessage } = properties ?? {};
    super(message ?? "Conflito de estado", {
      code: "CONFLICT_WARN",
      status: 409,
      userMessage,
      data,
    });
  }
}

/** 422 Unprocessable Entity — falha de validação de dados. */
export class ValidationWarn extends WarnError {
  constructor(message?: string, properties?: CustomErrorPartialProperties) {
    const { data, userMessage } = properties ?? {};
    super(message ?? "Falha de validação", {
      code: "VALIDATION_WARN",
      status: 422,
      userMessage,
      data,
    });
  }
}

/** 429 Too Many Requests — limite de requisições excedido. */
export class TooManyRequestsWarn extends WarnError {
  constructor(message?: string, properties?: CustomErrorPartialProperties) {
    const { data, userMessage } = properties ?? {};
    super(message ?? "Muitas requisições", {
      code: "TOO_MANY_REQUESTS_WARN",
      status: 429,
      userMessage,
      data,
    });
  }
}

/** 404 Unknown Route — rota inexistente ou não mapeada. */
export class UnknownRouteWarn extends WarnError {
  constructor(message?: string, properties?: CustomErrorPartialProperties) {
    const { data, userMessage } = properties ?? {};
    super(message ?? "Rota não encontrada", {
      code: "ROUTE_WARN",
      status: 404,
      userMessage,
      data,
    });
  }
}

/** 500 Auth subsystem failure — falha na autenticação/validação de token. */
export class AuthWarn extends WarnError {
  constructor(message?: string, properties?: CustomErrorPartialProperties) {
    const { data, userMessage } = properties ?? {};
    super(message ?? "Erro de autenticação/validação de token", {
      code: "AUTH_WARN",
      status: 401,
      userMessage,
      data,
    });
  }
}