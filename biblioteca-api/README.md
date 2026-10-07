# Biblioteca API
# Library API

A REST API for managing library authors, books, and loans, built with Node.js, Express, TypeScript, and MongoDB. Each feature follows a layered architecture: routes → controller → service → repository.

## Project Structure

```text
biblioteca-api/
	src/
		server.ts                 Entry point: connects to MongoDB and starts HTTP
		app.ts                    Configures Express, middleware, and routes
		api/v1/index.ts            Groups version 1 routes
		config/
			database.ts             MongoDB connection and initialization
			env.ts                  Environment variable configuration and defaults
		modules/
			authors/                Author operations
			books/                  Book operations
			loans/                  Loan and return operations
		shared/
			errors/                 Application errors
			middlewares/            Async handling and centralized error responses
```

Each feature module separates its responsibilities into five files:

- `*.routes.ts` maps HTTP methods and paths to controllers.
- `*.controller.ts` receives the request, calls the service, and builds the HTTP response.
- `*.service.ts` applies input validation and business rules.
- `*.repository.ts` reads and writes the corresponding MongoDB collection.
- `*.model.ts` defines entity and input types; it is not a Mongoose schema.

### Feature Modules

- **Authors:** creates, lists, retrieves, updates, and deletes authors. It validates names, nationalities, and birth years, and prevents deleting an author who has books.
- **Books:** manages books and their author relationship. It verifies that the author exists, prevents duplicate ISBNs, creates books as available, and prevents deleting books with loans.
- **Loans:** records loans for available books and synchronizes book availability. It supports retrieving, updating, returning, and deleting loans; returning a loan records the return date and makes the book available again.

### Application Startup

1. `src/server.ts` runs `bootstrap()`.
2. `bootstrap()` waits for `connectDB()` to connect to MongoDB.
3. After a successful connection, `app.listen(env.port)` starts the HTTP server. If the connection fails, the application reports the error and exits without listening on the port.
4. `src/app.ts` configures Express, middleware, `GET /health`, and the `/api/v1` route prefix.

The main port is configured with `PORT` in `biblioteca-api/.env`. `src/config/env.ts` converts it to a number and defaults to `3000`; `src/server.ts` passes that value to `app.listen()`. By default, the API is available at `http://localhost:3000`.

## Requirements

- Node.js 18 or newer and npm.
- A local MongoDB instance or MongoDB Atlas cluster.

## Installation and Usage

From the repository root, install the API dependencies:

```bash
npm install --prefix biblioteca-api
```

Copy `biblioteca-api/.env.example` to `biblioteca-api/.env` and configure `MONGO_URI` if needed. The example uses local MongoDB. Existing local environment settings and MongoDB collections are kept compatible with existing data.

Run in development mode:

```bash
npm run dev
```

Build and run the production version:

```bash
npm run build
npm start
```

`GET http://localhost:3000/health` checks whether the HTTP server is responding. The API starts listening only after it has connected to MongoDB.

## Endpoints

Base URL: `http://localhost:3000/api/v1`

| Method | Path | Description |
| --- | --- | --- |
| POST | `/authors` | Create an author |
| GET | `/authors` | List authors |
| GET | `/authors/:id` | Retrieve an author |
| PUT | `/authors/:id` | Update an author |
| DELETE | `/authors/:id` | Delete an author if it has no books |
| POST | `/books` | Create a book associated with an author |
| GET | `/books` | List books |
| GET | `/books/:id` | Retrieve a book |
| PUT | `/books/:id` | Update a book |
| DELETE | `/books/:id` | Delete a book if it has no loans |
| POST | `/loans` | Create a loan for an available book |
| GET | `/loans` | List loans |
| GET | `/loans/:id` | Retrieve a loan |
| PUT | `/loans/:id` | Update or return a loan |
| DELETE | `/loans/:id` | Delete a loan |

All IDs must be valid MongoDB ObjectIds. `year` must be an integer; `birthYear` must be a positive integer. A book requires `title`, `isbn`, and `authorId`; `available` defaults to `true`. A loan requires `bookId`, `userName`, and an ISO 8601 `loanDate`. Creating a loan makes the book unavailable. To return it, send `{"returned": true}` to `PUT /api/v1/loans/:id`; the server assigns `returnDate` and makes the book available again.

Example requests:

```bash
curl -X POST http://localhost:3000/api/v1/authors \
	-H "Content-Type: application/json" \
	-d '{"name":"Gabriel García Márquez","nationality":"Colombian","birthYear":1927}'
```

```bash
curl -X POST http://localhost:3000/api/v1/books \
	-H "Content-Type: application/json" \
	-d '{"title":"One Hundred Years of Solitude","isbn":"9780307474728","authorId":"<authorId>","year":1967}'
```

```bash
curl -X PUT http://localhost:3000/api/v1/loans/<loanId> \
	-H "Content-Type: application/json" \
	-d '{"returned":true}'
```

Ready-to-run HTTP requests are in [`requests.http`](requests.http). The supplied assignment brief remains unchanged.
