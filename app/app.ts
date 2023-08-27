import express from "express";
import { apiDocs } from "./api-docs/api-docs";
import { DatabaseOperations } from "./db/db";

export const createApp = (dbConnector: DatabaseOperations) => {
  const app = express();
  app.use("/docs", apiDocs);

  return app;
};
