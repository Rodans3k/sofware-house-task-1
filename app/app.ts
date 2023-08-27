import express from "express";
import { apiDocs } from "./api-docs/api-docs";
import { DbConnector } from "./db/db";
import { initDataBase } from "./db/dbInit";
import { moviesRouter } from "./routes/moviesRouter";


export const createApp = (db: DbConnector) => {
  initDataBase(db);
  const app = express();
  app.use("/docs", apiDocs);
  app.use("/api", moviesRouter);

  return app;
};
