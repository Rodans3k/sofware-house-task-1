import { PathLike } from "fs";
import * as fs from "fs/promises";

export interface DbConnector {
  readDB(): Promise<MovieJsonObject>;
  writeDB(dataToWrite: MovieJsonObject): Promise<void>;
}
export interface Movie {
  id: number;
  title: string;
  year: string;
  runtime: string;
  genres: string[];
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
    a.genres.every((el) => typeof el === "string") &&
    typeof a?.director === "string"
  );
}

export interface MovieJsonObject {
  genres?: string[];
  movies?: Movie[];
}

function isMovieJsonObject(a): a is MovieJsonObject {
  return (
    a?.genres &&
    Array.isArray(a.genres) &&
    a.genres.every((el) => typeof el === "string") &&
    a?.movies &&
    Array.isArray(a.movies) &&
    a.movies.every((el) => isMovie(el))
  );
}

export class JsonFileConnector implements DbConnector {
  filePath: PathLike;

  constructor(parameters: { filePath: PathLike }) {
    this.filePath = parameters.filePath;
  }

  async readDB(): Promise<MovieJsonObject> {
    const fileHandle = await fs.open(this.filePath);
    const data = await fileHandle.readFile({ encoding: "utf-8" });
    await fileHandle.close();
    const dataAsJson = JSON.parse(data);
    if (isMovieJsonObject(dataAsJson)) {
      return dataAsJson;
    } else throw new Error("no valid data in DB");
  }

  async writeDB(dataToWrite: MovieJsonObject): Promise<void> {
    const fileHandle = await fs.open(this.filePath, "w");
    await fileHandle.writeFile(JSON.stringify(dataToWrite), "utf-8");
    await fileHandle.close();
  }
}
