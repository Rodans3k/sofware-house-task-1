import { Movie } from "../db/db";
import { searchMovies } from "../routes/getMovie";

const movies: Movie[] = [
  {
    id: 1,
    title: "string",
    year: "1995",
    runtime: "60",
    genres: ["a", "b"],
    director: "string",
  },
  {
    id: 2,
    title: "stringification",
    year: "1995",
    runtime: "65",
    genres: ["c", "d"],
    director: "string",
  },
  {
    id: 3,
    title: "re-string",
    year: "1995",
    runtime: "70",
    genres: ["c", "d"],
    director: "string",
  },
  {
    id: 4,
    title: "string 4",
    year: "1995",
    runtime: "75",
    genres: ["d"],
    director: "string",
  },
];

describe("GET search test", () => {
  it.each([
    [
      movies,
      [
        {
          id: 1,
          title: "string",
          year: "1995",
          runtime: "60",
          genres: ["a", "b"],
          director: "string",
        },
      ],
      ["a", "b"],
      54,
    ],
    [
      movies,
      [
        {
          id: 1,
          title: "string",
          year: "1995",
          runtime: "60",
          genres: ["a", "b"],
          director: "string",
        },
      ],
      undefined,
      54,
    ],
    [
      movies,
      [
        {
          id: 1,
          title: "string",
          year: "1995",
          runtime: "60",
          genres: ["a", "b"],
          director: "string",
        },
      ],
      ["a", "b"],
      undefined,
    ],
    [
      movies,
      [
        {
          id: 1,
          title: "string",
          year: "1995",
          runtime: "60",
          genres: ["a", "b"],
          director: "string",
        },
      ],
      ["a", "b"],
      54,
    ],
  ])(
    "search test",
    (
      movies: Movie[],
      expectedResult: Movie[],
      searchGenres?: string[],
      searchRuntime?: number,
    ) => {
      const result = searchMovies(movies, searchGenres, searchRuntime);
      expect(result).toEqual(expectedResult);
    },
  );
});
