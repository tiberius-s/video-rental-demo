import type { ErrorRequestHandler } from "express";

export const catchAllErrorsMiddleware =
  (): ErrorRequestHandler =>
  (err, _req, res, _next): void => {
    console.error(err);
    res.status(500).send("Internal server error");
  };
