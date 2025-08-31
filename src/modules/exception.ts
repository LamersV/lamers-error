import { CustomErrorPartialProperties, CustomErrorProperties } from "../types";
import { CustomError } from "./custom";
import { WarnError } from "./warn";

/**
 * ExceptionError
 * Base para erros de servidor (família 5xx).
 - Garante, em tempo de execução, que o status esteja no range 5xx.
 - Caso receba um status 4xx, redireciona a criação para WarnError (cliente);
 - caso receba algo fora de 4xx/5xx, usa CustomError (fallback neutro).
 */
export class ExceptionError extends CustomError {
  constructor(message: string, properties?: CustomErrorProperties) {
    const status = properties?.status ?? 500;

    if (status < 500 || status > 599) {
      if (status >= 400 && status <= 499) {
        throw new WarnError(message, properties);
      }
      throw new CustomError(message, properties);
    }

    super(message, {
      ...properties,
      type: "error",
      status,
      code: properties?.code ?? "ERROR",
      userMessage: properties?.userMessage ?? message,
    });
  }

  /**
   * toHttp
   * Retorna shape pronto para resposta HTTP (Express/Fastify),
   * com status numérico e body enxuto e consistente.
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

/** 500 Internal Server Error — erro genérico do servidor. */
export class InternalServerError extends ExceptionError {
  constructor(message?: string, properties?: CustomErrorPartialProperties) {
    super(message ?? "Erro interno do servidor", {
      ...properties,
      code: "SYSTEM_ERROR",
      status: 500,
    });
  }
}

/** 500 Database Error — falha de infraestrutura/consulta no banco. */
export class DatabaseError extends ExceptionError {
  constructor(message?: string, properties?: CustomErrorPartialProperties) {
    const { data, userMessage } = properties ?? {};
    super(message ?? "Erro no banco de dados", {
      code: "DATABASE_ERROR",
      status: 500,
      userMessage,
      data,
    });
  }
}

/** 502 Bad Gateway — falha ao enviar e-mail via provedor/relay externo. */
export class MailError extends ExceptionError {
  constructor(message?: string, properties?: CustomErrorPartialProperties) {
    const { data, userMessage } = properties ?? {};
    super(message ?? "Erro ao enviar e-mail", {
      code: "MAIL_ERROR",
      status: 502,
      userMessage,
      data,
    });
  }
}

/** 500 Encryption subsystem failure — falha ao criptografar. */
export class EncryptError extends ExceptionError {
  constructor(message?: string, properties?: CustomErrorPartialProperties) {
    const { data, userMessage } = properties ?? {};
    super(message ?? "Erro ao criptografar valor", {
      code: "ENCRYPT_ERROR",
      status: 500,
      userMessage,
      data,
    });
  }
}

/** 500 Configuration bootstrap failure — erro ao carregar/configurar ambiente. */
export class ConfigError extends ExceptionError {
  constructor(message?: string, properties?: CustomErrorPartialProperties) {
    const { data, userMessage } = properties ?? {};
    super(message ?? "Erro ao carregar configurações", {
      code: "CONFIG_ERROR",
      status: 500,
      userMessage,
      data,
    });
  }
}

/** 502 Integration upstream failure — falha em serviço externo/upstream. */
export class IntegrationError extends ExceptionError {
  constructor(message?: string, properties?: CustomErrorPartialProperties) {
    const { data, userMessage } = properties ?? {};
    super(message ?? "Erro na integração com serviços externos", {
      code: "INTEGRATION_ERROR",
      status: 502,
      userMessage,
      data,
    });
  }
}

/** 504 Gateway Timeout — serviço externo demorou além do limite. */
export class TimeoutError extends ExceptionError {
  constructor(message?: string, properties?: CustomErrorPartialProperties) {
    const { data, userMessage } = properties ?? {};
    super(message ?? "Tempo limite excedido", {
      code: "TIMEOUT_ERROR",
      status: 504,
      userMessage,
      data,
    });
  }
}

/** 507 Insufficient Storage — pouca capacidade (disco/obj storage). */
export class StorageError extends ExceptionError {
  constructor(message?: string, properties?: CustomErrorPartialProperties) {
    const { data, userMessage } = properties ?? {};
    super(message ?? "Erro de armazenamento", {
      code: "STORAGE_ERROR",
      status: 507,
      userMessage,
      data,
    });
  }
}

/** 503 Service Unavailable — indisponibilidade/intermitência de rede. */
export class NetworkError extends ExceptionError {
  constructor(message?: string, properties?: CustomErrorPartialProperties) {
    const { data, userMessage } = properties ?? {};
    super(message ?? "Erro de rede", {
      code: "NETWORK_ERROR",
      status: 503,
      userMessage,
      data,
    });
  }
}

/** 500 Logging pipeline failure — falha na tubulação de logs/observabilidade. */
export class LogError extends ExceptionError {
  constructor(message?: string, properties?: CustomErrorPartialProperties) {
    const { data, userMessage } = properties ?? {};
    super(message ?? "Erro de log", {
      code: "LOG_ERROR",
      status: 500,
      userMessage,
      data,
    });
  }
}

/** 507 Memory pressure / allocation failure — memória insuficiente. */
export class MemoryError extends ExceptionError {
  constructor(message?: string, properties?: CustomErrorPartialProperties) {
    const { data, userMessage } = properties ?? {};
    super(message ?? "Erro de memória", {
      code: "MEMORY_ERROR",
      status: 507,
      userMessage,
      data,
    });
  }
}

/** 500 Auth subsystem failure — falha na autenticação/validação de token. */
export class AuthError extends ExceptionError {
  constructor(message?: string, properties?: CustomErrorPartialProperties) {
    const { data, userMessage } = properties ?? {};
    super(message ?? "Erro de autenticação/validação de token", {
      code: "AUTH_ERROR",
      status: 500,
      userMessage,
      data,
    });
  }
}