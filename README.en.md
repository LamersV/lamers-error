# @lamersv/error

Small TypeScript package to standardize error handling in Node/TS applications. Provides a hierarchy of typed, HTTP-oriented errors, with base classes for **client errors (4xx)** and **server errors (5xx)**, a utility for **message normalization**, types for **HTTP responses**, and a static factory to **wrap unknown errors** (narrowing `unknown`).

The goal is to enable consistent logging, user-friendly messages, and predictable HTTP responses in Express/HTTP APIs. The source code is written in TypeScript and the published package exposes the compiled output under `dist`. The distribution follows an exports map for the main module and also for direct imports of specific modules and types.

## Installation

This package is published on GitHub Packages under the `@lamersv` scope. Configure your `.npmrc` pointing to the GitHub registry:

```
@lamersv:registry=https://npm.pkg.github.com
```

Then install using your preferred package manager:

```
npm install @lamersv/error
```

```
yarn add @lamersv/error
```

```
pnpm add @lamersv/error
```

## Overview

The library exports:

- `CustomError`: base class with structured fields (`code`, `type`, `status`, `userMessage`, `data`, `cause`) and static helpers (`is`, `from`).
- `WarnError` (4xx) and subclasses: `BadRequestWarn`, `UnauthorizedWarn`, `ForbiddenWarn`, `NotFoundWarn`, `ConflictWarn`, `ValidationWarn`, `TooManyRequestsWarn`, `UnknownRouteWarn`, `AuthWarn`.
- `ExceptionError` (5xx) and subclasses: `InternalServerError`, `DatabaseError`, `MailError`, `EncryptError`, `ConfigError`, `IntegrationError`, `TimeoutError`, `StorageError`, `NetworkError`, `LogError`, `MemoryError`, `AuthError`.
- Auxiliary types like `CustomErrorType`, `UnknownError`, `HttpErrorBody<T>`, `HttpErrorResponse<T>` and conventions for `CustomErrorCode` (accepting patterns like `FOO_ERROR`/`FOO_WARN` or free codes).

## Basic usage

You can import everything from the index or specific modules, depending on bundle needs.

```ts
// Index (aggregated)
import {
  CustomError,
  WarnError,
  ExceptionError,
  NotFoundWarn,
  InternalServerError,
  type UnknownError,
  type HttpErrorResponse,
} from "@lamersv/error";

// Module imports
import { CustomError } from "@lamersv/error/modules/custom";
import { WarnError, NotFoundWarn } from "@lamersv/error/modules/warn";
import { ExceptionError, TimeoutError } from "@lamersv/error/modules/exception";
```

### Creating client errors (4xx)

```ts
import { BadRequestWarn, NotFoundWarn, ValidationWarn } from "@lamersv/error";

throw new BadRequestWarn("Invalid parameters", {
  code: "PARAMS_WARN",
  userMessage: "Please review the provided data.",
  data: { field: "email" },
});

throw new NotFoundWarn("Resource not found", {
  code: "RESOURCE_WARN",
  userMessage: "The requested item does not exist.",
});
```

### Creating server errors (5xx)

```ts
import { InternalServerError, TimeoutError, DatabaseError } from "@lamersv/error";

throw new InternalServerError("Unexpected failure", {
  code: "UNEXPECTED_ERROR",
  userMessage: "Your request could not be completed.",
});

throw new TimeoutError("External call timeout", {
  code: "TIMEOUT_ERROR",
  userMessage: "The service took too long to respond.",
  data: { service: "payments" },
});

throw new DatabaseError("Database query error", {
  code: "DB_ERROR",
  userMessage: "Service temporarily unavailable.",
});
```

### Wrapping `unknown` with `CustomError.from`

```ts
import { CustomError, type UnknownError } from "@lamersv/error";

try {
  await doSomething();
}
catch (e: UnknownError) {
  const err = CustomError.from(e, { code: "SYSTEM_ERROR" });
  logger.error({ err });
  throw err;
}
```

## Express integration

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

## Conventions and types

- `CustomError` always includes: `code`, `type`, `status`, `userMessage`, `data?`, `cause?`  
- `WarnError` enforces 4xx status; `ExceptionError` enforces 5xx.  
- `HttpErrorResponse<TData>` models a simple response envelope with `status` and `body`.  

## Additional examples

### Validation with `ValidationWarn`

```ts
import { ValidationWarn } from "@lamersv/error";

function validateInput(input: any) {
  if (!input?.email) {
    throw new ValidationWarn("Email required", {
      code: "VALIDATION_WARN",
      userMessage: "Please provide a valid email.",
      data: { field: "email" },
    });
  }
}
```

### Unknown route with `UnknownRouteWarn`

```ts
import { UnknownRouteWarn } from "@lamersv/error";
import express from "express";

const app = express();

app.use((_req, _res, next) => {
  next(new UnknownRouteWarn("Route not found", { code: "ROUTE_WARN" }));
});
```

### Timeout and external services

```ts
import { TimeoutError } from "@lamersv/error";

async function callGateway() {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 5_000);

  try {
    const res = await fetch("https://example.com", { signal: ctrl.signal });
    if (!res.ok) throw new TimeoutError("Gateway timeout", { code: "TIMEOUT_ERROR" });
    return await res.json();
  } 
  catch (e) {
    throw new TimeoutError("External service unavailable", {
      code: "TIMEOUT_ERROR",
      userMessage: "Our service is slow. Please try again shortly.",
      data: { service: "gateway" },
    });
  } 
  finally {
    clearTimeout(t);
  }
}
```

## License

MIT. See the license file in the official repository. [LICENSE](./LICENSE)
