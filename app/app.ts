import express from "express";
import { apiDocs } from "./api-docs/api-docs";

export const createApp = () => {
  const app = express();
  app.use("/docs", apiDocs);

  return app;
};
