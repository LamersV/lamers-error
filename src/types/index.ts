/**
 * Tipos de erro.
 - Mantém compatibilidade com seu padrão original e reforça a distinção client/server.
 */
export type CustomErrorType = "error" | "warn";
/**
 * Sufixos de código de erro.
 - Mantém compatibilidade com seu padrão original e reforça a distinção client/server.
 */
export type ErrorSuffix = "ERROR" | "WARN";

/**
 * Status HTTP comuns para clientes (4xx).
 */
export type HttpStatusClient =
  | 400 | 401 | 403 | 404 | 405 | 406 | 407 | 408 | 409
  | 410 | 412 | 413 | 414 | 415 | 416 | 417 | 418
  | 421 | 422 | 423 | 424 | 426 | 428 | 429 | 431 | 451;

/**
 * Status HTTP comuns para servidores (5xx).
 */
export type HttpStatusServer =
  | 500 | 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 510 | 511;

/**
 * Códigos de erro.
 - Mantém compat com o formato livre anterior, mas oferece tipos específicos para WARN/ERROR.
 - Recomendado: usar UPPER_SNAKE_CASE com sufixo _ERROR ou _WARN.
 */
export type ClientErrorCode = `${Uppercase<string>}_WARN`;
export type ServerErrorCode = `${Uppercase<string>}_ERROR`;

/** Compat anterior: permite `${string}_${'ERROR'|'WARN'}` ou string solta. */
export type CustomErrorCode =
  | `${string}_${ErrorSuffix}`
  | `${string}`;

/**
 * Payload de dados associado ao erro (genérico).
 - Por padrão, um objeto simples, mas pode ser especializado por chamada/classe.
 */
export type ErrorData = Record<string, unknown>;

/**
 * Propriedades básicas para construir um erro customizado.
 */
export interface CustomErrorProperties<TData = ErrorData> {
  code?: CustomErrorCode;
  type?: CustomErrorType;
  status?: number; // Base genérica permite qualquer número; subclasses restringem para 4xx/5xx
  data?: TData;
  userMessage?: string;
  cause?: unknown;
}

/**
 * Versão parcial usada nas subclasses, como no seu código.
 */
export interface CustomErrorPartialProperties<TData = ErrorData>
  extends Pick<CustomErrorProperties<TData>, "data" | "userMessage"> { }

/**
 * Versão especializada para HttpClientError (4xx).
 - Sinaliza via tipo que status deve ser 4xx e code deve terminar com _WARN.
 */
export interface ClientErrorProperties<TData = ErrorData>
  extends Omit<CustomErrorProperties<TData>, "type" | "status" | "code"> {
  type?: "warn";
  status?: HttpStatusClient;
  code?: ClientErrorCode;
}

/**
 * Versão especializada para HttpServerError (5xx).
 - Sinaliza via tipo que status deve ser 5xx e code deve terminar com _ERROR.
 */
export interface ServerErrorProperties<TData = ErrorData>
  extends Omit<CustomErrorProperties<TData>, "type" | "status" | "code"> {
  type?: "error";
  status?: HttpStatusServer;
  code?: ServerErrorCode;
}

/**
 * Estrutura “parseada” de erro (útil para normalizar de fontes variadas).
 */
export interface ErrorParserProperties<TData = ErrorData> {
  message: string;
  code: CustomErrorCode;
  status: number;
  type?: CustomErrorType;
  data?: TData;
}

/**
 * Shape de resposta HTTP pronto para uso por Express/Fastify (toHttp()).
 */
export interface HttpErrorBody<TData = ErrorData> {
  code: CustomErrorCode;
  type: CustomErrorType;
  message: string;
  data: TData | null;
}

export interface HttpErrorResponse<TData = ErrorData> {
  status: number;
  body: HttpErrorBody<TData>;
}

/**
 * Auxiliar para erros desconhecidos vindos de catch (narrowing).
 */
export type UnknownError = unknown;
