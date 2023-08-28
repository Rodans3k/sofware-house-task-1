import express, { Request, Response } from "express";
import { addMovie } from "./addMovie";
import { getMovies } from "./getMovie";

const moviesRouter = express.Router();

moviesRouter.get("/movies", getMovies);
moviesRouter.post("/movies", addMovie);

export { moviesRouter };
