import express, { Request, Response } from "express";
import { getDbConnector } from "../db/dbInit";
import { Movie } from "../db/db";

interface SearchQuery {
  runtime?: string;
  genres?: string;
}

export async function getMovies(
  req: Request<unknown, unknown, unknown, SearchQuery>,
  res: Response,
) {
  const searchRuntime = req.query.runtime;
  const searchGenres = req.query.genres?.split(",").map((el) => el.trim());
  let genres: string[];
  let movies: Movie[];

  // Read DB
  try {
    ({ genres, movies } = await getDataFromDb());
  } catch (error) {
    return res.status(500).send(`DB read error: ${error}`);
  }

  // Validate query params
  try {
    const validationErrors = queryValidator(
      genres,
      searchRuntime,
      searchGenres,
    );
    if (validationErrors.length > 0) {
      throw new Error(`${validationErrors.join(", ")}`);
    }
  } catch (error) {
    return res.status(400).send(`Query validation error: ${error}`);
  }

  // Search movies
  const searchResults = searchMovies(
    movies,
    searchGenres?.length > 0 ? searchGenres : undefined,
    searchRuntime ? parseInt(searchRuntime) : undefined,
  );

  // return movies list
  return res.status(200).send(searchResults);
}

async function getDataFromDb() {
  const dbConnector = getDbConnector();
  const { genres, movies } = await dbConnector.readDB();
  return { genres, movies };
}

function arrayContainsAnother(
  containingArray: string[],
  testedArray: string[],
) {
  return testedArray.every((element) => containingArray.includes(element));
}

function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

function queryValidator(
  allowedGenres: string[],
  runtime?: string,
  genres?: string[],
) {
  const errors = [];
  if (!!runtime && (isNaN(parseInt(runtime)) || parseInt(runtime) <= 0))
    errors.push("invalid runtime");
  if (!!genres && !arrayContainsAnother(allowedGenres, genres))
    errors.push("genre outside predefined genres");

  return errors;
}

export function searchMovies(
  movies: Movie[],
  searchGenres?: string[],
  searchRuntime?: number,
): Movie[] {
  let searchResults: Movie[] = [];
  const runtimeRangeLeafs = 10;
  const searchPartialsDict: { [k: string]: number } = {};
  if (movies.length < 1) return [];
  if (searchGenres) {
    movies.forEach((movie) => {
      searchGenres.forEach((searchGenre) => {
        if (movie.genres.includes(searchGenre)) {
          if (!!searchPartialsDict[movie.id])
            searchPartialsDict[movie.id] = searchPartialsDict[movie.id] + 1;
          else searchPartialsDict[movie.id] = 1;
        }
      });
    });
    // { (movie id): (hits) } -> [[(movie id), (hits)]] -> sort (most matching genres / lowest id) -> map into movies
    if (Object.keys(searchPartialsDict).length > 0) {
      searchResults = Object.entries(searchPartialsDict)
        .sort((a, b) =>
          a[1] < b[1] || (a[1] === b[1] && parseInt(a[0]) > parseInt(b[0]))
            ? 1
            : -1,
        )
        .map((el): Movie => {
          const movieId = parseInt(el[0]);
          const movieIndex = movies.findIndex((el) => {
            return el.id === movieId;
          });
          return movies[movieIndex];
        });
    }
  } else {
    searchResults = [...movies];
  }

  if (searchRuntime) {
    searchResults = searchResults?.filter((el) =>
      inRange(
        parseInt(el.runtime),
        searchRuntime - runtimeRangeLeafs,
        searchRuntime + runtimeRangeLeafs,
      ),
    );
  }

  if (!searchRuntime && !searchGenres) {
    searchResults ? (searchResults = [searchResults[0]]) : []; // https://xkcd.com/221/
  }

  return searchResults ? searchResults : [];
}
