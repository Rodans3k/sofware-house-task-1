import express, { Request, Response } from "express";
import { getDbConnector } from "../db/dbInit";
import { Movie } from "../db/db";

const addMovieRouter = express.Router();

addMovieRouter.use(addMovie);

export interface inputMovie {
  title: string;
  year: string;
  runtime: string;
  genres: string[];
  director: string;
  actors?: string;
  plot?: string;
  posterUrl?: string;
}
export function isInputMovie(a): a is inputMovie {
  return (
    typeof a?.title === "string" &&
    typeof a?.year === "string" &&
    typeof a?.runtime === "string" &&
    a?.genres &&
    Array.isArray(a.genres) &&
    a.genres.every((el) => typeof el === "string") &&
    typeof a?.director === "string"
  );
}

export async function addMovie(req: Request, res: Response) {
  const rawInput = req.body;
  let genres: string[];
  let movies: Movie[];
  let inputMovie: inputMovie;
  let newMovieInDb: Movie;

  // Read DB
  try {
    ({ genres, movies } = await getDataFromDb());
  } catch (error) {
    return res.status(500).send(`DB read error: ${error}`);
  }

  // Validate input
  try {
    if (isInputMovie(rawInput)) {
      const validationErrors = inputValidator(rawInput, genres);

      if (validationErrors.length > 0) {
        throw new Error(`${validationErrors.join(", ")}`);
      }

      inputMovie = rawInput;
    } else {
      throw new Error(`invalid body format`);
    }
  } catch (error) {
    return res.status(400).send(`Input validation error: ${error}`);
  }

  // Check if duplicate
  try {
    const { isUnique, newId } = searchDuplicates(inputMovie, movies);
    if (!isUnique) throw new Error("Movie is already in database");
    newMovieInDb = { ...inputMovie, id: newId };
  } catch (error) {
    return res.status(400).send(`Duplication error: ${error}`);
  }

  // Write data to DB
  try {
    await saveDataIntoDb(newMovieInDb, movies, genres);
  } catch (error) {
    return res.status(500).send(`Error while saving into DB: ${error}`);
  }

  // Send response, with saved object
  return res.status(200).send(newMovieInDb);
}

export function inputValidator(
  input: inputMovie,
  allowedGenres: string[],
): string[] {
  const errors = [];
  if (isNaN(parseInt(input.year))) errors.push("invalid year");
  if (isNaN(parseInt(input.runtime)) || parseInt(input.runtime) <= 0)
    errors.push("invalid runtime");
  if (input.title.length > 255)
    errors.push("title too long, max 255 characters");
  if (input.director.length > 255)
    errors.push("director too long, max 255 characters");
  if (!arrayContainsAnother(allowedGenres, input.genres))
    errors.push("genre outside predefined genres");
  return errors;
}

function arrayContainsAnother(
  containingArray: string[],
  testedArray: string[],
) {
  return testedArray.every((element) => containingArray.includes(element));
}

async function getDataFromDb() {
  const dbConnector = getDbConnector();
  const { genres, movies } = await dbConnector.readDB();
  return { genres, movies };
}

async function saveDataIntoDb(
  newMovie: Movie,
  oldMovies: Movie[],
  genres: string[],
) {
  const dbConnector = getDbConnector();
  await dbConnector.writeDB({ genres, movies: [...oldMovies, newMovie] });
}

function searchDuplicates(
  input: inputMovie,
  movies: Movie[],
): { isUnique: boolean; newId: number } {
  let freeIds = Array.from(Array(movies.length + 1).keys()).map((el) => el + 1);
  let isUnique = true;
  for (const movie of movies) {
    if (
      movie.director === input.director &&
      movie.title === input.title &&
      movie.runtime === input.runtime &&
      movie.year === input.year &&
      arrayContainsAnother(movie.genres, input.genres) &&
      arrayContainsAnother(input.genres, movie.genres)
    ) {
      isUnique = false;
      break;
    }
    const indexToRemove = freeIds.findIndex((el) => el === movie.id);
    if (indexToRemove > -1) freeIds.splice(indexToRemove, 1);
  }

  return { isUnique, newId: isUnique ? freeIds[0] : undefined };
}
