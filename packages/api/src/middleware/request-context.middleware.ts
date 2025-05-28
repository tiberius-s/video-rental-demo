import type { Request, RequestHandler } from "express";
import type { Logger } from "pino";

export interface RequestContextConfig {
  logger: Logger;
}

const bindings = new WeakMap<Request, RequestContext>();

export class RequestContext {
  readonly #logger: Logger;

  private constructor(fields: RequestContextConfig) {
    this.#logger = fields.logger;
  }

  static get(req: Request) {
    const ctx = bindings.get(req);
    if (!ctx) {
      throw new Error("Request context not set");
    }
    return ctx;
  }

  get logger(): Logger {
    return this.#logger;
  }

  static set(req: Request, context: RequestContextConfig): void {
    const ctx = new RequestContext(context);
    bindings.set(req, ctx);
  }
}

export function requestContextMiddleware(config: RequestContextConfig): RequestHandler {
  return (req, _res, next) => {
    RequestContext.set(req, config);
    next();
  };
}
