# Bolt Bucket

Bolt Bucket is a React car-customization app backed by an Express API and PostgreSQL. Users can configure a car, set a budget, save builds, and view, edit, or delete saved builds.

## Run locally

1. Add the Render PostgreSQL connection values to `server/.env` as `PGUSER`, `PGPASSWORD`, `PGHOST`, `PGPORT`, and `PGDATABASE`.
2. Run `npm install` from the repository root.
3. Run `npm run dev` and open the Vite URL printed in the terminal.

The server creates the `custom_cars` table when it starts. Keep database credentials in `server/.env`; do not commit that file.

## API

- `GET /api/cars/options` returns the available models and priced customization choices.
- `GET /api/cars` and `GET /api/cars/:id` read saved builds.
- `POST /api/cars` creates a build.
- `PUT /api/cars/:id` updates a build.
- `DELETE /api/cars/:id` deletes a build.

The server calculates prices and checks budgets and model/engine compatibility rather than trusting values supplied by the browser.