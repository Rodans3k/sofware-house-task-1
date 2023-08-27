import request from "supertest";
import { createApp } from "../app";
import { DatabaseOperations, MovieJsonObject } from "../db/db";
// Mocking filesaving
class MockedDb implements DatabaseOperations {
  constructor() {}
  dbData: MovieJsonObject;
  readDB = jest.fn(async () => {
    return this.dbData;
  });
  writeDB = jest.fn(async (dataToWrite) => {});

  setDbData(newDbState: MovieJsonObject) {
    this.dbData = newDbState;
  }
}

const appMockedDb = new MockedDb();
const allowedGenres = [
  "Comedy",
  "Fantasy",
  "Crime",
  "Drama",
  "Music",
  "Adventure",
  "History",
  "Thriller",
  "Animation",
  "Family",
  "Mystery",
  "Biography",
  "Action",
  "Film-Noir",
  "Romance",
  "Sci-Fi",
  "War",
  "Western",
  "Horror",
  "Musical",
  "Sport",
];

const illegalGenres = [
  "Mockumentary",
  "Banananimation",
  "Bananagraphy",
  "Banana-Fi",
];

const exampleMovies = [
  {
    id: 1,
    title: "Movie number 1",
    year: "2004",
    runtime: "98",
    genres: [allowedGenres[0], allowedGenres[1], allowedGenres[2]],
    director: "Trey Parker",
    actors: "Trey Parker, Matt Stone, Elle Russ",
    plot: "When North Korean ruler Kim Jong-il (Trey Parker) orchestrates a global terrorist plot, it's up to the heavily armed marionettes of the highly specialized Team America unit to stop his dastardly scheme.",
    posterUrl: "https://en.wikipedia.org/wiki/Team_America:_World_Police",
  },
  {
    id: 2,
    title: "Movie number 2",
    year: "2004",
    runtime: "65",
    genres: [allowedGenres[0], allowedGenres[4], allowedGenres[5]],
    director: "Random guy (not Guy Ritchie)",
    actors: "random actors",
  },
  {
    id: 3,
    title: "Movie number 3",
    year: "2004",
    runtime: "122",
    genres: [allowedGenres[0], allowedGenres[1], allowedGenres[5]],
    director: "Trey Parker",
  },
  {
    id: 4,
    title: "Movie number 4",
    year: "2004",
    runtime: "148",
    genres: [allowedGenres[5], allowedGenres[6], allowedGenres[7]],
    director: "Trey Parker",
  },
];

appMockedDb.writeDB.mock.lastCall;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Testing /movies GET endpoint", () => {
  const endpoint = `/api/movies`;
  describe("Testing getting random movie", () => {
    it("Returns 200 with empty list if no movies are present in DB ", async () => {
      // Prepare
      const expectedResponseBody = [];
      const initialDbContent: MovieJsonObject = {
        genres: [],
        movies: [],
      };
      appMockedDb.setDbData(initialDbContent);
      const app = createApp(appMockedDb);

      // Execute
      const response = await request(app).get(`${endpoint}`);

      // Compare
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual(expectedResponseBody);
    });
    it("Returns 200 and random movie", async () => {
      // Prepare
      const initialDbContent: MovieJsonObject = {
        genres: allowedGenres,
        movies: exampleMovies,
      };
      appMockedDb.setDbData(initialDbContent);
      const app = createApp(appMockedDb);

      // Execute
      const response = await request(app).get(`${endpoint}`);

      // Compare
      expect(response.statusCode).toEqual(200);
      expect(exampleMovies).toHaveBeenCalledWith(
        expect.objectContaining(response.body),
      );
    });
  });
  describe("Testing genre search", () => {
    it("Returns 200 with empty list if no movies are present in DB ", async () => {
      // Prepare
      const expectedResponseBody = [];
      const initialDbContent: MovieJsonObject = {
        genres: allowedGenres,
        movies: [],
      };
      const searchParameters = {
        runtime: undefined,
        genres: allowedGenres[0],
      };
      appMockedDb.setDbData(initialDbContent);
      const app = createApp(appMockedDb);

      // Execute
      const response = await request(app)
        .get(`${endpoint}`)
        .query(searchParameters);

      // Compare
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual(expectedResponseBody);
    });
    it("Returns 200 with empty list if no movies match the search criteria", async () => {
      // Prepare
      const expectedResponseBody = [];
      const initialDbContent: MovieJsonObject = {
        genres: allowedGenres,
        movies: [
          { ...exampleMovies[0], genres: [allowedGenres[1], allowedGenres[2]] },
          { ...exampleMovies[2], genres: [allowedGenres[1], allowedGenres[2]] },
        ],
      };
      const searchParameters = {
        runtime: undefined,
        genres: allowedGenres[0],
      };
      appMockedDb.setDbData(initialDbContent);
      const app = createApp(appMockedDb);

      // Execute
      const response = await request(app)
        .get(`${endpoint}`)
        .query(searchParameters);

      // Compare
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual(expectedResponseBody);
    });
    it("Returns 200 and list with single matching movie", async () => {
      // Prepare
      const expectedResponseBody = [
        { ...exampleMovies[0], genres: [allowedGenres[0], allowedGenres[1]] },
      ];
      const initialDbContent: MovieJsonObject = {
        genres: allowedGenres,
        movies: [
          expectedResponseBody[1],
          { ...exampleMovies[2], genres: [allowedGenres[2], allowedGenres[3]] },
        ],
      };
      const searchParameters = {
        runtime: undefined,
        genres: `${allowedGenres[0]}, ${allowedGenres[5]}`,
      };
      appMockedDb.setDbData(initialDbContent);
      const app = createApp(appMockedDb);

      // Execute
      const response = await request(app)
        .get(`${endpoint}`)
        .query(searchParameters);

      // Compare
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual(expectedResponseBody);
    });
    it("Returns 200 and list with multiple matching movies, ordered from most matching to least", async () => {
      // Prepare
      const expectedResponseBody = [
        {
          ...exampleMovies[0],
          id: 11,
          genres: [allowedGenres[0], allowedGenres[1], allowedGenres[2]],
        },
        {
          ...exampleMovies[1],
          id: 12,
          genres: [allowedGenres[0], allowedGenres[1], allowedGenres[3]],
        },
        {
          ...exampleMovies[2],
          id: 13,
          genres: [allowedGenres[0], allowedGenres[1]],
        },
        { ...exampleMovies[3], id: 14, genres: [allowedGenres[0]] },
      ];
      const initialDbContent: MovieJsonObject = {
        genres: allowedGenres,
        movies: [
          expectedResponseBody[1],
          { ...exampleMovies[2], genres: [allowedGenres[2], allowedGenres[3]] },
        ],
      };
      const searchParameters = {
        runtime: undefined,
        genres: `${allowedGenres[0]}, ${allowedGenres[1]}, ${allowedGenres[1]}`,
      };
      appMockedDb.setDbData(initialDbContent);
      const app = createApp(appMockedDb);

      // Execute
      const response = await request(app)
        .get(`${endpoint}`)
        .query(searchParameters);

      // Compare
      expect(response.statusCode).toEqual(200);
      expect(response.body.length).toEqual(expectedResponseBody.length);
      for (let index = 0; index < response.body.length; index++) {
        expect(response.body[index]).toEqual(expectedResponseBody[index]);
      }
    });
    it("Returns 400 for incorrect genres in query", async () => {
      // Prepare
      const initialDbContent: MovieJsonObject = {
        genres: allowedGenres,
        movies: exampleMovies,
      };
      const searchParameters = {
        runtime: undefined,
        genres: `${illegalGenres[0]}`,
      };
      appMockedDb.setDbData(initialDbContent);
      const app = createApp(appMockedDb);

      // Execute
      const response = await request(app)
        .get(`${endpoint}`)
        .query(searchParameters);

      // Compare
      expect(response.statusCode).toEqual(400);
    });
    it("Returns 400 for mix of correct & incorrect genres", async () => {
      // Prepare
      const initialDbContent: MovieJsonObject = {
        genres: allowedGenres,
        movies: exampleMovies,
      };
      const searchParameters = {
        runtime: undefined,
        genres: `${illegalGenres[0]}, ${allowedGenres[0]}`,
      };
      appMockedDb.setDbData(initialDbContent);
      const app = createApp(appMockedDb);

      // Execute
      const response = await request(app)
        .get(`${endpoint}`)
        .query(searchParameters);

      // Compare
      expect(response.statusCode).toEqual(400);
    });
  });
  describe("Testing runtime search", () => {
    it("Returns 200 with empty list if no movies are present in DB", async () => {
      // Prepare
      const expectedResponseBody = [];
      const initialDbContent: MovieJsonObject = {
        genres: allowedGenres,
        movies: [],
      };
      const searchParameters = {
        runtime: `60`,
        genres: undefined,
      };
      appMockedDb.setDbData(initialDbContent);
      const app = createApp(appMockedDb);

      // Execute
      const response = await request(app)
        .get(`${endpoint}`)
        .query(searchParameters);

      // Compare
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual(expectedResponseBody);
    });
    it("Returns 200 with empty list if no movies match the search criteria", async () => {
      // Prepare
      const expectedResponseBody = [];
      const initialDbContent: MovieJsonObject = {
        genres: allowedGenres,
        movies: [
          { ...exampleMovies[0], runtime: "49" },
          { ...exampleMovies[1], runtime: "71" },
        ],
      };
      const searchParameters = {
        runtime: `60`,
        genres: undefined,
      };
      appMockedDb.setDbData(initialDbContent);
      const app = createApp(appMockedDb);

      // Execute
      const response = await request(app)
        .get(`${endpoint}`)
        .query(searchParameters);

      // Compare
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual(expectedResponseBody);
    });
    it("Returns 200 with matching list of movies", async () => {
      // Prepare
      const expectedResponseBody = [
        { ...exampleMovies[0], runtime: "55" },
        { ...exampleMovies[1], runtime: "65" },
      ];
      const initialDbContent: MovieJsonObject = {
        genres: allowedGenres,
        movies: [
          { ...exampleMovies[3], runtime: "49" },
          { ...exampleMovies[4], runtime: "71" },
        ],
      };
      const searchParameters = {
        runtime: `60`,
        genres: undefined,
      };
      appMockedDb.setDbData(initialDbContent);
      const app = createApp(appMockedDb);

      // Execute
      const response = await request(app)
        .get(`${endpoint}`)
        .query(searchParameters);

      // Compare
      expect(response.statusCode).toEqual(200);
      expect(response.body.length).toEqual(expectedResponseBody.length);
      response.body.forEach((responseMovie) => {
        expect(expectedResponseBody).toHaveBeenCalledWith(
          expect.objectContaining(responseMovie),
        );
      });
    });
    it("Returns 200 with matching list of movies, contains edge cases", async () => {
      // Prepare
      const expectedResponseBody = [
        { ...exampleMovies[0], runtime: "50" },
        { ...exampleMovies[1], runtime: "70" },
      ];
      const initialDbContent: MovieJsonObject = {
        genres: allowedGenres,
        movies: [
          { ...exampleMovies[3], runtime: "49" },
          { ...exampleMovies[4], runtime: "71" },
        ],
      };
      const searchParameters = {
        runtime: `60`,
        genres: undefined,
      };
      appMockedDb.setDbData(initialDbContent);
      const app = createApp(appMockedDb);

      // Execute
      const response = await request(app)
        .get(`${endpoint}`)
        .query(searchParameters);

      // Compare
      expect(response.statusCode).toEqual(200);
      expect(response.body.length).toEqual(expectedResponseBody.length);
      response.body.forEach((responseMovie) => {
        expect(expectedResponseBody).toHaveBeenCalledWith(
          expect.objectContaining(responseMovie),
        );
      });
    });
  });
  describe("Testing genre and runtime search", () => {
    it("Returns 200 with empty list if no movies are present in DB ", async () => {
      // Prepare
      const expectedResponseBody = [];
      const initialDbContent: MovieJsonObject = {
        genres: allowedGenres,
        movies: [],
      };
      const searchParameters = {
        runtime: undefined,
        genres: allowedGenres[0],
      };
      appMockedDb.setDbData(initialDbContent);
      const app = createApp(appMockedDb);

      // Execute
      const response = await request(app)
        .get(`${endpoint}`)
        .query(searchParameters);

      // Compare
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual(expectedResponseBody);
    });
    it.each([
      [
        {
          genres: allowedGenres,
          movies: [
            {
              ...exampleMovies[0],
              genres: [allowedGenres[1], allowedGenres[2]],
              runtime: "60",
            },
            {
              ...exampleMovies[2],
              genres: [allowedGenres[1], allowedGenres[2]],
              runtime: "60",
            },
          ],
        },
        {
          runtime: "60",
          genres: allowedGenres[0],
        },
        [],
        {
          genres: allowedGenres,
          movies: [
            {
              ...exampleMovies[0],
              genres: [allowedGenres[0], allowedGenres[2]],
              runtime: "90",
            },
            {
              ...exampleMovies[2],
              genres: [allowedGenres[0]],
              runtime: "20",
            },
          ],
        },
        {
          runtime: "60",
          genres: allowedGenres[0],
        },
        [],
      ],
    ])(
      "Returns 200 with empty list if no movies match the search criteria",
      async (
        initialDbContent: MovieJsonObject,
        searchParameters: { runtime: string; genres: string },
        expectedResponseBody: Array<any>,
      ) => {
        // Prepare
        appMockedDb.setDbData(initialDbContent);
        const app = createApp(appMockedDb);

        // Execute
        const response = await request(app)
          .get(`${endpoint}`)
          .query(searchParameters);

        // Compare
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual(expectedResponseBody);
      },
    );
    it.each([
      [
        {
          genres: allowedGenres,
          movies: [
            {
              ...exampleMovies[0],
              genres: [allowedGenres[0], allowedGenres[1]],
              runtime: "60",
            },
            {
              ...exampleMovies[2],
              genres: [allowedGenres[2], allowedGenres[3]],
              runtime: "60",
            },
          ],
        },
        {
          runtime: "60",
          genres: `${allowedGenres[0]}, ${allowedGenres[5]}`,
        },
        [{ ...exampleMovies[0], genres: [allowedGenres[0], allowedGenres[1]] }],
      ],
      [
        {
          genres: allowedGenres,
          movies: [
            {
              ...exampleMovies[0],
              genres: [allowedGenres[0], allowedGenres[1]],
              runtime: "60",
            },
            {
              ...exampleMovies[2],
              genres: [allowedGenres[0], allowedGenres[5]],
              runtime: "80",
            },
          ],
        },
        {
          runtime: "60",
          genres: `${allowedGenres[0]}, ${allowedGenres[5]}`,
        },
        [{ ...exampleMovies[0], genres: [allowedGenres[0], allowedGenres[1]] }],
      ],
    ])(
      "Returns 200 and list with single matching movie",
      async (
        initialDbContent: MovieJsonObject,
        searchParameters: { runtime: string; genres: string },
        expectedResponseBody: Array<any>,
      ) => {
        // Prepare
        appMockedDb.setDbData(initialDbContent);
        const app = createApp(appMockedDb);

        // Execute
        const response = await request(app)
          .get(`${endpoint}`)
          .query(searchParameters);

        // Compare
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual(expectedResponseBody);
      },
    );
    it.each([
      [
        {
          genres: allowedGenres,
          movies: [
            {
              ...exampleMovies[0],
              id: 11,
              genres: [allowedGenres[0], allowedGenres[1], allowedGenres[2]],
              runtime: "60",
            },
            {
              ...exampleMovies[1],
              id: 12,
              genres: [allowedGenres[0]],
              runtime: "60",
            },
            {
              ...exampleMovies[2],
              id: 13,
              genres: [allowedGenres[3]],
              runtime: "60",
            },
            {
              ...exampleMovies[3],
              id: 14,
              genres: [allowedGenres[0], allowedGenres[1]],
              runtime: "60",
            },
          ],
        },
        {
          runtime: "60",
          genres: `${allowedGenres[0]}, ${allowedGenres[1]}, ${allowedGenres[2]}`,
        },
        [
          {
            ...exampleMovies[0],
            id: 11,
            genres: [allowedGenres[0], allowedGenres[1], allowedGenres[2]],
            runtime: "60",
          },
          {
            ...exampleMovies[3],
            id: 14,
            genres: [allowedGenres[0], allowedGenres[1]],
            runtime: "60",
          },
          {
            ...exampleMovies[1],
            id: 13,
            genres: [allowedGenres[0]],
            runtime: "60",
          },
        ],
      ],
      [
        {
          genres: allowedGenres,
          movies: [
            {
              ...exampleMovies[0],
              id: 11,
              genres: [allowedGenres[0], allowedGenres[1], allowedGenres[2]],
              runtime: "80",
            },
            {
              ...exampleMovies[1],
              id: 12,
              genres: [allowedGenres[0]],
              runtime: "60",
            },
            {
              ...exampleMovies[2],
              id: 13,
              genres: [allowedGenres[3]],
              runtime: "60",
            },
            {
              ...exampleMovies[3],
              id: 14,
              genres: [allowedGenres[0], allowedGenres[1]],
              runtime: "60",
            },
          ],
        },
        {
          runtime: "60",
          genres: `${allowedGenres[0]}, ${allowedGenres[1]}, ${allowedGenres[2]}`,
        },
        [
          {
            ...exampleMovies[3],
            id: 14,
            genres: [allowedGenres[0], allowedGenres[1]],
            runtime: "60",
          },
          {
            ...exampleMovies[1],
            id: 13,
            genres: [allowedGenres[0]],
            runtime: "60",
          },
        ],
      ],
    ])(
      "Returns 200 and list with multiple matching movies, ordered from most matching to least",
      async (
        initialDbContent: MovieJsonObject,
        searchParameters: { runtime: string; genres: string },
        expectedResponseBody: Array<any>,
      ) => {
        // Prepare
        appMockedDb.setDbData(initialDbContent);
        const app = createApp(appMockedDb);

        // Execute
        const response = await request(app)
          .get(`${endpoint}`)
          .query(searchParameters);

        // Compare
        expect(response.statusCode).toEqual(200);
        expect(response.body.length).toEqual(expectedResponseBody.length);
        for (let index = 0; index < response.body.length; index++) {
          expect(response.body[index]).toEqual(expectedResponseBody[index]);
        }
      },
    );
    it("Returns 400 for incorrect genres in query", async () => {
      // Prepare
      const initialDbContent: MovieJsonObject = {
        genres: allowedGenres,
        movies: exampleMovies,
      };
      const searchParameters = {
        runtime: "80",
        genres: `${illegalGenres[0]}`,
      };
      appMockedDb.setDbData(initialDbContent);
      const app = createApp(appMockedDb);

      // Execute
      const response = await request(app)
        .get(`${endpoint}`)
        .query(searchParameters);

      // Compare
      expect(response.statusCode).toEqual(400);
    });
    it("Returns 400 for mix of correct & incorrect genres", async () => {
      // Prepare
      const initialDbContent: MovieJsonObject = {
        genres: allowedGenres,
        movies: exampleMovies,
      };
      const searchParameters = {
        runtime: "80",
        genres: `${illegalGenres[0]}, ${allowedGenres[0]}`,
      };
      appMockedDb.setDbData(initialDbContent);
      const app = createApp(appMockedDb);

      // Execute
      const response = await request(app)
        .get(`${endpoint}`)
        .query(searchParameters);

      // Compare
      expect(response.statusCode).toEqual(400);
    });
  });
});

describe("Testing /movies POST endpoint", async () => {
  const endpoint = `/api/movies`;
  describe("only required fields", () => {
    it.each([
      [{
        genres: allowedGenres,
        movies: [exampleMovies[0]],
      }, {
        title: "string",
        year: "string",
        runtime: "string",
        genres: [],
        director: "string",
  }]
    ])("Returns 400 if any parameter is invalid", async (initialDbContent: MovieJsonObject, postBody: object) => {
      // Prepare
      appMockedDb.setDbData(initialDbContent);
      const app = createApp(appMockedDb);
      // Execute
      const response = await request(app).post(endpoint).send(postBody)
      // Compare

    })
  })
});
