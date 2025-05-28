import type { Application } from "express";
import express from "express";
import type { Logger } from "pino";
import { catchAllErrorsMiddleware } from "./middleware/catch-all-errors.middleware.js";

export interface AppConfig {
  logger: Logger;
}

export class App {
  readonly #instance: Application;
  readonly #logger: Logger;

  private constructor(config: AppConfig) {
    this.#instance = express();
    this.#logger = config.logger;
    this.init();
  }

  static from(config: AppConfig) {
    return new App(config);
  }

  private init() {
    this.#logger.info("Initializing Express application");
    // Middleware
    this.#instance.use(express.json());

    // Error handlers last
    this.#instance.use(catchAllErrorsMiddleware());
  }
}
