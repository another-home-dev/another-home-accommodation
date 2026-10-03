# Another Home — Accommodation Service

Manages the hostel itself: buildings, rooms, beds, students and room allocation. It also links each student's Asgardeo sign-in to their student record.

Part of [Another Home](https://github.com/another-home-dev). Reached through the API gateway at `/api/v1/accommodation`.

## What it does

- Stores buildings, the rooms on each floor, and the beds in each room, with occupancy totals.
- Registers students and assigns them to rooms.
- Resolves the signed-in student on every app launch (`GET /students/me`):
  - if a warden registered the student earlier, it links the two by email on first sign-in;
  - if the student signed up on Asgardeo themselves, it creates their record, so they appear in the warden's student list.

## API

Paths are relative to `/api/v1/accommodation`. Write operations need the `warden`, `super-admin` or `staff` role, which the gateway passes in `x-user-roles`.

| Method | Path | Who | Purpose |
| --- | --- | --- | --- |
| GET | `/students/me` | Student | Get (or link or create) the signed-in student's record, with their room |
| PATCH | `/students/me` | Student | Update the signed-in student's profile |
| GET | `/students` | Any signed-in user | List students with their room |
| POST | `/students` | Staff | Register a student |
| GET | `/buildings` | Any signed-in user | List buildings with occupancy |
| POST | `/buildings` | Staff | Create a building |
| GET | `/rooms` | Any signed-in user | List rooms with capacity |
| POST | `/rooms` | Staff | Create a room |
| PATCH | `/rooms/:id` | Staff | Update a room |
| DELETE | `/rooms/:id` | Staff | Delete a room |
| POST | `/rooms/:id/assign` | Staff | Assign a student to the next free bed in a room |
| POST | `/beds` | Staff | Add a bed to a room |
| GET | `/allocations` | Any signed-in user | List bed allocations |
| POST | `/allocations` | Staff | Assign a student to a specific bed |
| GET | `/health` | Anyone | Health check for Kubernetes and Consul |

Interactive docs: `/api/docs` on the gateway, or `http://localhost:4001/api/docs` when running locally.

## Configuration

| Variable | Purpose | Default |
| --- | --- | --- |
| `PORT` | Port to listen on | `4001` |
| `DB_HOST`, `DB_PORT` | MySQL server | `localhost`, `3308` |
| `DB_USERNAME`, `DB_PASSWORD` | MySQL credentials | |
| `DB_DATABASE` | Database name | `another_home_accommodation` |
| `CONSUL_HOST`, `CONSUL_PORT` | Service registry to register with | |
| `SERVICE_ADDRESS` | Address this service registers under in Consul | |

## Run locally

The easiest way is to start the whole system with `docker compose up --build` from [another-home-infra](https://github.com/another-home-dev/anotherhome-infrastructure). Its README shows how to clone every repository into the folder names it expects.

To run this service on its own, with a MySQL server available:

```bash
npm install
npm run start:dev
```

## Tests

```bash
npm test                    # unit tests: use cases and the roles guard
npm run test:e2e            # end-to-end tests
npm run test:db-integration # repository tests against a real MySQL database
```

## Project structure

The service follows clean architecture: the domain has no framework code, and the outer layers depend inward.

```
src/
├── domain/
│   ├── entities/          Building, Room, Bed, Student
│   └── ports/             repository interfaces
├── application/
│   └── use-cases/         one class per operation (create room, allocate bed, resolve current student…)
└── infrastructure/
    ├── controllers/       HTTP endpoints
    ├── database/          TypeORM entities, mappers and repositories
    ├── dto/               request validation
    └── guards/            role checks
```

## Deployment

`cloudbuild.yaml` runs on every push to `main`: tests, Docker build, push to Artifact Registry, then a rolling update of the `accommodation` deployment on GKE.
