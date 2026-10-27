# swap-frontend

Frontend client for **Swap** — a platform for student tutoring, academic material exchange, and peer-to-peer services.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 |
| Language | TypeScript |
| Styling | CSS (BEM methodology) |
| State Management | Zustand |
| Forms | React Hook Form |
| Date Utilities | date-fns |
| Real-time | Socket.io Client |
| Containerization | Docker |

## Project Structure

```
swap-frontend/
├── src/
│   ├── app/             # Next.js App Router pages
│   ├── components/      # Reusable UI components
│   ├── store/           # Zustand global state
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # API client and utilities
│   └── styles/          # Global CSS and BEM modules
├── public/              # Static assets
├── Dockerfile
├── .env.example
└── README.md
```

## Services (Docker)

| Container | Image | Port |
|---|---|---|
| `frontend` | node:22.22.3-alpine3.22 | 3000 |

## Getting Started

### Prerequisites

- Node.js 22 and npm for local development
- [Docker](https://www.docker.com/) with Buildx for container builds
- `swap-backend` running (see backend repo)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/<org>/swap-frontend.git
   cd swap-frontend
   ```

2. Copy the environment file and fill in the values:
   ```bash
   cp .env.example .env
   ```

3. Install the exact dependencies and run locally:
   ```bash
   npm ci
   npm run dev
   ```

4. The app will be available at `http://localhost:3000`

### Run with Docker Compose

`docker compose up --build -d` requires the Buildx CLI plugin because the
Dockerfile uses a BuildKit secret mount for the Server Actions key. Verify it
with `docker buildx version`. On Manjaro/Arch, install `docker-buildx` with
`sudo pacman -S docker-buildx`; on Debian/Ubuntu with Docker's repository,
install `docker-buildx-plugin`.

Before building, set `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` in your local `.env`
to a stable base64 key generated with `openssl rand -base64 32`. Keep that key
out of Git and reuse it for subsequent builds. Setting `DOCKER_BUILDKIT=0`
cannot build this Dockerfile because the classic builder does not support
secret mounts.

### Environment Variables

See `.env.example` for all required variables. Key ones:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_DEFAULT_AVATAR_URL=https://i.pravatar.cc/150?u=vendedor
```

Docker builds, immutable dependency updates and the two-build reproducibility
check are documented in
[`docs/builds-reproducibles.md`](docs/builds-reproducibles.md).

## Pages

| Route | Description |
|---|---|
| `/` | Home — tutors, materials, and businesses |
| `/tutors` | Browse and filter available tutors |
| `/materials` | Browse and filter academic materials |
| `/businesses` | Browse student businesses |
| `/profile` | User profile and account |
| `/chat` | Real-time messaging |
| `/admin` | Moderator panel |

## Contributing

1. Create a branch from `main`: `git checkout -b feature/your-feature`
2. Commit your changes
3. Open a Pull Request

## Team

Swap — Universidad del Valle de Guatemala, CC3090 Ingeniería de Software I, Semestre I 2026
