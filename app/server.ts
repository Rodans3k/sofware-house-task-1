import { createApp } from "./app";
import { JsonFileConnector } from "./db/db";

const port = process.env.PORT || 3000;
const dbJsonPath = process.env.DB_FILE_PATH || "database.json";

const db = new JsonFileConnector({ filePath: dbJsonPath });
const app = createApp(db);

const server = app.listen(port, onListening);
server.on("error", onError);

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
  console.log(`Listening on ${bind}`);
}

export default server;
