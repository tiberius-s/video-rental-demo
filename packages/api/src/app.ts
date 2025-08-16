import { OpenApiSpec } from "@video-rental/domain";
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

    // Routes
    this.setupRoutes();

    // Error handlers last
    this.#instance.use(catchAllErrorsMiddleware());
  }

  private setupRoutes() {
    // Health check endpoint
    this.#instance.get("/health", (req, res) => {
      res.json({
        status: "healthy",
        service: "video-rental-api",
        timestamp: new Date().toISOString(),
      });
    });

    // OpenAPI spec endpoint - demonstrates domain-first workflow
    this.#instance.get("/openapi", async (req, res) => {
      try {
        const spec = OpenApiSpec.getParsedSpec();
        res.json(spec);
      } catch (error) {
        this.#logger.error(error, "Failed to load OpenAPI spec");
        res.status(500).json({ error: "Failed to load OpenAPI specification" });
      }
    });
  }
}
