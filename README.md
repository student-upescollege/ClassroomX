# AiCodeLab

A live coding assessment platform for classrooms. Faculty create timed coding sessions with AI-generated questions, hidden test cases, and proctoring. Students solve problems in a browser-based Monaco IDE and get instant auto-graded results.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, Tailwind CSS, Monaco Editor |
| Backend | NestJS, Prisma ORM |
| Database | PostgreSQL |
| AI | LangChain + OpenAI (gpt-4o) |
| Code Execution | Node.js, Python 3, GCC (local) |

---

## Prerequisites

Make sure the following are installed on your machine:

| Tool | Windows | Mac |
|---|---|---|
| Node.js (v18+) | [nodejs.org](https://nodejs.org) | `brew install node` |
| pnpm | `npm install -g pnpm` | `npm install -g pnpm` |
| PostgreSQL | [postgresql.org](https://www.postgresql.org/download/) | `brew install postgresql` |
| Docker (optional) | [docker.com](https://www.docker.com/products/docker-desktop/) | `brew install --cask docker` |
| Python 3 | [python.org](https://www.python.org/downloads/) | `brew install python` |
| GCC | Install via MinGW / MSYS2 | `brew install gcc` |
| Git | [git-scm.com](https://git-scm.com) | `brew install git` |

---

## Project Structure

```
major-main/
├── ClassroomX_client/   # Next.js frontend (port 3000)
└── ClassroomX_server/   # NestJS backend  (port 3001)
```

---

## 1. Clone the Repository

```bash
git clone <your-repo-url>
cd major-main
```

---

## 2. Backend Setup (NestJS)

### Navigate to the server folder

```bash
cd ClassroomX_server
```

### Install dependencies

```bash
pnpm install
```

### Set up environment variables

Create a `.env` file in `ClassroomX_server/`:

```env
DATABASE_URL="postgresql://postgres:123@localhost:5434/test?schema=public"
JWT_SECRET="your_jwt_secret_here"
OPENAI_API_KEY="sk-..."
MODEL_NAME="gpt-4o"
```

### Start PostgreSQL

**Option A — Using Docker (recommended, works same on Windows & Mac):**

```bash
pnpm db:dev:up
```

This starts a PostgreSQL container on port `5434`.

**Option B — Using a local PostgreSQL install:**

Create a database named `test` and update `DATABASE_URL` in `.env` to point to it.

```
postgresql://postgres:<your_password>@localhost:5432/test?schema=public
```

### Run Prisma migrations

```bash
npx prisma migrate deploy
```

Or, for development with auto-migration:

```bash
npx prisma migrate dev
```

### Start the backend server

```bash
pnpm start:dev
```

Backend runs at **http://localhost:3001**

---

## 3. Frontend Setup (Next.js)

Open a new terminal window:

```bash
cd ClassroomX_client
```

### Install dependencies

```bash
npm install
```

### Start the frontend

```bash
npm run dev
```

Frontend runs at **http://localhost:3000**

---

## Running the App

Once both servers are running:

| Portal | URL |
|---|---|
| Landing Page | http://localhost:3000 |
| Faculty Sign In | http://localhost:3000/auth/signin |
| Student Sign In | http://localhost:3000/auth/signin |
| Backend API | http://localhost:3001 |

---

## Common Issues

### Port 3000 already in use
Next.js will automatically use the next available port (3002, 3003, etc.). Check the terminal output for the actual URL.

### Database connection failed
- Make sure Docker is running if using the Docker option
- Check that `DATABASE_URL` in `.env` matches your PostgreSQL setup
- Run `pnpm db:dev:up` to start the database container

### Prisma client not generated
```bash
npx prisma generate
```

### Python/GCC not found during code execution
Make sure `python3` and `gcc` are accessible from the terminal (added to system PATH).

**Windows:** Add Python and MinGW/GCC to your system PATH via Environment Variables settings.

**Mac:** If installed via Homebrew, they should be on PATH automatically.

---

## Environment Variables Reference

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:123@localhost:5434/test?schema=public` |
| `JWT_SECRET` | Secret key for JWT tokens | any random string |
| `OPENAI_API_KEY` | OpenAI API key for AI features | `sk-...` |
| `MODEL_NAME` | OpenAI model to use | `gpt-4o` |
