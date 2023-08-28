# software-house-task-1

## Running app

How to run application:

### Using Docker compose
Requirements:
- docker compose [How to install docker compose](https://docs.docker.com/compose/install/)

1. build the required images using:
```bash
docker compose build
```

2. run application using:
```bash
docker compose up
```

### Using npm
Requirements:
- NPM [How to install Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

1. download packages using:
```bash
npm install
```

2. build the js code
```bash
npm run build
```

3. copy database file into `app/` project directory as database.json, or provide path in env variable `DB_FILE_PATH`

4. run application using
```bash
npm start
```

## Using the application

At `localhost:3000/docs/` there is full openapi specification of available endpoints.
Note: Using swagger UI it's possible to query those endpoints from browser.

## Application development

### Scripts
`package.json` includes few scripts to help development

Running tests:
```bash
npm run test
```

Code prettier:
```bash
npm run pf
```
Running application with nodemon (restarts server after code changes)
```bash
npm run start-test
```

### Working with docker compose
- [docker compose CLI reference](https://docs.docker.com/compose/reference/)

To connect into running docker compose container run:
```bash
docker compose exec server /bin/sh
```
This allows to comfortably run commands inside container.

Alternatively run: 
```bash
docker compose exec server <command> 
```
to execute command on running container from outside.

