# @lamersv/error

Pequeno pacote em TypeScript para padronizar tratamento de erros em aplicações Node/TS. Fornece uma hierarquia de erros tipados e orientados a HTTP, com classes base para **erros de cliente (4xx)** e **erros de servidor (5xx)**, utilitário para **normalização de mensagens**, tipos para **respostas HTTP** e uma fábrica estática para **embrulhar erros desconhecidos** (narrowing de `unknown`).

O objetivo é facilitar logs consistentes, mensagens amigáveis para o usuário e respostas HTTP previsíveis em APIs Express/HTTP. O código-fonte está em TypeScript e a publicação expõe a saída compilada em `dist`. A distribuição segue um mapa de exports para o módulo principal e também para importação direta de módulos e tipos específicos.

## Instalação

Este pacote é publicado no GitHub Packages sob o escopo `@lamersv`. Configure seu `.npmrc` apontando para o registro do GitHub:

```
@lamersv:registry=https://npm.pkg.github.com
```

Em seguida, instale com seu gerenciador preferido:

```
npm install @lamersv/error
```

```
yarn add @lamersv/error
```

```
pnpm add @lamersv/error
```

## Visão geral

A biblioteca exporta:

- `CustomError`: classe base com campos estruturados (`code`, `type`, `status`, `userMessage`, `data`, `cause`) e utilidades estáticas (`is`, `from`).
- `WarnError` (4xx) e subclasses: `BadRequestWarn`, `UnauthorizedWarn`, `ForbiddenWarn`, `NotFoundWarn`, `ConflictWarn`, `ValidationWarn`, `TooManyRequestsWarn`, `UnknownRouteWarn`, `AuthWarn`.
- `ExceptionError` (5xx) e subclasses: `InternalServerError`, `DatabaseError`, `MailError`, `EncryptError`, `ConfigError`, `IntegrationError`, `TimeoutError`, `StorageError`, `NetworkError`, `LogError`, `MemoryError`, `AuthError`.
- Tipos auxiliares como `CustomErrorType`, `UnknownError`, `HttpErrorBody<T>`, `HttpErrorResponse<T>` e convenções de código (`CustomErrorCode` aceitando padrões como `FOO_ERROR`/`FOO_WARN` ou livres).

## Uso básico

Você pode importar tudo do índice ou módulos específicos, conforme a necessidade do bundle.

```ts
// Index (agregado)
import {
  CustomError,
  WarnError,
  ExceptionError,
  NotFoundWarn,
  InternalServerError,
  type UnknownError,
  type HttpErrorResponse,
} from "@lamersv/error";

// Importações por módulo
import { CustomError } from "@lamersv/error/modules/custom";
import { WarnError, NotFoundWarn } from "@lamersv/error/modules/warn";
import { ExceptionError, TimeoutError } from "@lamersv/error/modules/exception";
```

### Criando erros de cliente (4xx)

```ts
import { BadRequestWarn, NotFoundWarn, ValidationWarn } from "@lamersv/error";

throw new BadRequestWarn("Parâmetros inválidos", {
  code: "PARAMS_WARN",
  userMessage: "Revise os dados enviados.",
  data: { field: "email" },
});

throw new NotFoundWarn("Recurso não encontrado", {
  code: "RESOURCE_WARN",
  userMessage: "O item solicitado não existe.",
});
```

### Criando erros de servidor (5xx)

```ts
import { InternalServerError, TimeoutError, DatabaseError } from "@lamersv/error";

throw new InternalServerError("Falha inesperada", {
  code: "UNEXPECTED_ERROR",
  userMessage: "Não foi possível concluir sua solicitação.",
});

throw new TimeoutError("Timeout na chamada externa", {
  code: "TIMEOUT_ERROR",
  userMessage: "O serviço demorou para responder.",
  data: { service: "payments" },
});

throw new DatabaseError("Erro ao consultar banco", {
  code: "DB_ERROR",
  userMessage: "Serviço temporariamente indisponível.",
});
```

### Embrulhando `unknown` com `CustomError.from`

```ts
import { CustomError, type UnknownError } from "@lamersv/error";

try {
  await fazAlgo();
} 
catch (e: UnknownError) {
  const err = CustomError.from(e, { code: "SYSTEM_ERROR" });
  logger.error({ err });
  throw err;
}
```

## Integração com Express

```ts
import type { Request, Response, NextFunction } from "express";
import { CustomError, WarnError, ExceptionError, type HttpErrorResponse } from "@lamersv/error";

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const base = CustomError.from(err);

  const isClient = base.status >= 400 && base.status <= 499;
  const isServer = base.status >= 500 && base.status <= 599;

  const normalized =
    isClient ? new WarnError(base.message, base)
    : isServer ? new ExceptionError(base.message, base)
    : new CustomError(base.message, { ...base, status: 500, type: "error", code: "SYSTEM_ERROR" });

  const body: HttpErrorResponse = {
    status: normalized.status,
    body: {
      code: normalized.code,
      type: normalized.type,
      message: normalized.message,
      userMessage: normalized.userMessage,
      data: normalized.data ?? null,
    },
  };

  res.status(body.status).json(body.body);
}
```

## Convenções e tipos

- `CustomError` sempre carrega: `code`, `type`, `status`, `userMessage`, `data?`, `cause?`  
- `WarnError` impõe status 4xx; `ExceptionError` impõe 5xx.  
- `HttpErrorResponse<TData>` modela um envelope de resposta com `status` e `body`.  

## Exemplos práticos adicionais

### Validação com `ValidationWarn`

```ts
import { ValidationWarn } from "@lamersv/error";

function validarEntrada(input: any) {
  if (!input?.email) {
    throw new ValidationWarn("Email obrigatório", {
      code: "VALIDATION_WARN",
      userMessage: "Informe um e-mail válido.",
      data: { field: "email" },
    });
  }
}
```

### Rota inexistente com `UnknownRouteWarn`

```ts
import { UnknownRouteWarn } from "@lamersv/error";
import express from "express";

const app = express();

app.use((_req, _res, next) => {
  next(new UnknownRouteWarn("Rota não encontrada", { code: "ROUTE_WARN" }));
});
```

### Timeout e serviços externos

```ts
import { TimeoutError } from "@lamersv/error";

async function chamarGateway() {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 5_000);

  try {
    const res = await fetch("https://exemplo.com", { signal: ctrl.signal });
    if (!res.ok) throw new TimeoutError("Timeout no gateway", { code: "TIMEOUT_ERROR" });
    return await res.json();
  } 
  catch (e) {
    throw new TimeoutError("Serviço externo indisponível", {
      code: "TIMEOUT_ERROR",
      userMessage: "Nosso serviço está lento. Tente novamente em instantes.",
      data: { service: "gateway" },
    });
  } 
  finally {
    clearTimeout(t);
  }
}
```

## Licença

MIT. Consulte o arquivo de licença no repositório oficial. [LICENSE](./LICENSE)
