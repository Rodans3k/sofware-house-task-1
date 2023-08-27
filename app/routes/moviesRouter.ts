import express, { Request, Response } from "express";
import { addMovie } from "./addMovie";

const moviesRouter = express.Router();

moviesRouter.post("/movies", addMovie);

export { moviesRouter };