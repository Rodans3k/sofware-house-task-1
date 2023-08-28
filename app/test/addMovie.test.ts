import { inputValidator, inputMovie } from "../routes/addMovie";

const validMov: inputMovie = {
  title: "string",
  year: "string",
  runtime: "string",
  genres: ["a", "b"],
  director: "string",
};

describe("POST input validator test", () => {
  it.each([
    [
      {
        title: "string",
        year: "string",
        runtime: "string",
        genres: ["a", "b"],
        director: "string",
      },
      ["a", "b"],
      2,
    ],
    [
      {
        title: "string",
        year: "2020",
        runtime: "string",
        genres: ["a", "b"],
        director: "string",
      },
      ["a", "b"],
      1,
    ],
    [
      {
        title: "string",
        year: "2020",
        runtime: "160",
        genres: ["c", "b"],
        director: "string",
      },
      ["a", "b"],
      1,
    ],
    [
      {
        title: "string",
        year: "2020",
        runtime: "160",
        genres: ["a", "b"],
        director: "string",
      },
      ["a", "b"],
      0,
    ],
    [
      {
        title: "string",
        year: "-1936",
        runtime: "-160",
        genres: ["a", "b"],
        director: "string",
      },
      ["a", "b"],
      1,
    ],
    [
      {
        title: "string",
        year: "996",
        runtime: "-160",
        genres: ["a", "b"],
        director: "string",
      },
      ["a", "b"],
      1,
    ],
    [
      {
        title: "string",
        year: "-1955",
        runtime: "160",
        genres: ["a", "b"],
        director: "string",
      },
      ["a", "b"],
      0,
    ],
    [
      {
        title:
          "To cut ravioli without a ravioli cutter, first lay one sheet of pasta dough onto a floured surface. Evenly space out tablespoons of the filling on the sheet, and then lay another pasta sheet on top. Press the dough around each mound of filling to remove any air and then cut out squares with a pastry or pizza cutter wheel. No pastry or pizza wheel? Use an overturned thin glass cup, a floured cookie cutter or a knife to carefully cut around the mounds of filling.",
        year: "1912",
        runtime: "160",
        genres: ["a", "b"],
        director: "string",
      },
      ["a", "b"],
      1,
    ],
    [
      {
        title: "string",
        year: "1912",
        runtime: "160",
        genres: ["a", "b"],
        director:
          "To cut ravioli without a ravioli cutter, first lay one sheet of pasta dough onto a floured surface. Evenly space out tablespoons of the filling on the sheet, and then lay another pasta sheet on top. Press the dough around each mound of filling to remove any air and then cut out squares with a pastry or pizza cutter wheel. No pastry or pizza wheel? Use an overturned thin glass cup, a floured cookie cutter or a knife to carefully cut around the mounds of filling.",
      },
      ["a", "b"],
      1,
    ],
  ])(
    "validate inputs",
    (properInput: inputMovie, genres: string[], numberOfErrors: number) => {
      expect(inputValidator(properInput, genres).length).toEqual(
        numberOfErrors,
      );
    },
  );
});
