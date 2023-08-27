import { DbConnector } from "./db";

let dbConnector: DbConnector;

export function initDataBase(db: DbConnector) {
  if (!dbConnector) dbConnector = db;
}

export function getDbConnector(): DbConnector {
  return dbConnector;
}
