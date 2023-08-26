import { serve, setup } from "swagger-ui-express";
import express from "express";
import * as openApiSpec from "./openapi.json";

const apiDocs = express.Router();
apiDocs.use(serve, setup(openApiSpec));

export { apiDocs };
