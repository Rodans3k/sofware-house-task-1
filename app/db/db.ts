import e from "express";
import { PathLike } from "fs";
import * as fs from "fs/promises";

interface Movie {
  id: number;
  title: string;
  year: string;
  runtime: string;
  genres: [string];
  director: string;
  actors?: string;
  plot?: string;
  posterUrl?: string;
}

function isMovie(a): a is Movie {
  return (
    typeof a?.id === "number" &&
    typeof a?.title === "string" &&
    typeof a?.year === "string" &&
    typeof a?.runtime === "string" &&
    a?.genres &&
    Array.isArray(a.genres) &&
    a.genres.forEach((el) => typeof el === "string") &&
    typeof a?.director === "string"
  );
}

interface MovieJsonObject {
  genres: [string];
  movies: [Movie];
}

function isMovieJsonObject(a): a is MovieJsonObject {
  return (
    a?.genres &&
    Array.isArray(a.genres) &&
    a.genres.forEach((el) => typeof el === "string") &&
    a?.movies &&
    Array.isArray(a.movies) &&
    a.movies.forEach((el) => isMovie(el))
  );
}

class databaseConnector {
  filePath: PathLike;

  constructor(parameters: { filePath: PathLike }) {
    this.filePath = parameters.filePath;
  }

  async readMovies(): Promise<Movie[]> {
    const fileHandle = await fs.open(this.filePath);
    const data = await fileHandle.readFile({ encoding: "utf-8" });
    const dataAsJson = JSON.parse(data);
    if (isMovieJsonObject(dataAsJson)) {
      const { movies } = dataAsJson;
      return movies;
    } else throw new Error("DB read error: no valid data for movies");
  }

  async readGenres(): Promise<string[]> {
    const fileHandle = await fs.open(this.filePath);
    const data = await fileHandle.readFile({ encoding: "utf-8" });
    const dataAsJson = JSON.parse(data);
    if (isMovieJsonObject(dataAsJson)) {
      const { genres } = dataAsJson;
      return genres;
    } else throw new Error("DB read error: no valid data for genres");
  }

  async searchMovies(params: {
    genres?: string[];
    durationMin?: number;
    durationMax?: number;
  }): Promise<Movie[]> {
    const movies = await this.readMovies;

    const searchResult: Movie[] = [];
    return searchResult;
  }

  private isMovieTheSame(movieA: Movie, movieB: Movie): boolean {
    return (
      movieA.director === movieB.director &&
      movieA.genres === movieB.genres &&
      movieA.title === movieB.title &&
      movieA.year === movieB.year &&
      movieA.runtime === movieB.runtime
    );
  }

  private async checkDuplicate(
    movieToCheck: Movie,
  ): Promise<{ isUnique: boolean; newId?: number }> {
    const movies = await this.readMovies();
    let maxId = movieToCheck.id;
    
    const duplicates = movies.filter((el) => {
      maxId = maxId < el.id ? el.id : maxId;
      return this.isMovieTheSame(el, movieToCheck);
    });

    const isUnique = duplicates.length === 0;

    return { isUnique, newId: isUnique && maxId };
  }

  async writeMovie(movieToSave: Movie): Promise<Movie> {
    const {isUnique, newId} = await this.checkDuplicate(movieToSave)
    if (isUnique) {
      movieToSave = { ...movieToSave, id: newId }
      const fileHandle = await fs.open(this.filePath);
      const data = await fileHandle.readFile({ encoding: "utf-8" });
      const dataAsJson = JSON.parse(data);
      if (isMovieJsonObject(dataAsJson)) {
        const { movies } = dataAsJson;
  
        return movieToSave;

    } else throw new Error("Duplicate");
    
    } else throw new Error("DB read error: no valid data for genres");
  }
}
