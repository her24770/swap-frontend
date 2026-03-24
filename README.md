# swap-frontend

Frontend client for **Swap** — a platform for student tutoring, academic material exchange, and peer-to-peer services.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 |
| Language | TypeScript |
| Styling | CSS (BEM methodology) |
| State Management | Zustand |
| Forms | React Hook Form |
| Date Utilities | date-fns |
| Real-time | Socket.io Client |
| Containerization | Docker + Docker Compose |

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
├── docker-compose.yml
├── .env.example
└── README.md
```

## Services (Docker)

| Container | Image | Port |
|---|---|---|
| `frontend` | node:20-alpine | 3000 |

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose installed
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

3. Start the frontend:
   ```bash
   docker compose up --build
   ```

4. The app will be available at `http://localhost:3000`

### Environment Variables

See `.env.example` for all required variables. Key ones:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

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
