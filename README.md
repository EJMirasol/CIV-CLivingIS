# REKLAMO System

A system for managing Church meetings and conferences.

**REKLAMO** — Registration, Environment, Kitchen, Living, Accommodation, Medical, Overall

## Features

- Participant registration with check-in tracking
- Accommodation and room management
- Group creation, assignment, and capacity tracking
- Finance tracking, billing, expenses, and returns
- Dashboard analytics and data export
- Authentication and role-based access

## Tech Stack

- React Router v7 (SSR)
- React 19 + TypeScript
- PostgreSQL + Prisma ORM
- Tailwind CSS v4 + shadcn/ui
- Conform + Zod validation

## Getting Started

### Prerequisites

- Node.js 20.x
- PostgreSQL
- npm

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Configure environment
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your database credentials and auth secret.

5. Database setup
   ```bash
   npx prisma generate
   npx prisma db push
   ```

### Development

```bash
npm run dev
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run typecheck` | Run type checking |
| `npm run build` | Production build |
| `npm run start` | Start production server |

## Deployment

Configure environment variables on your hosting platform:

- `DATABASE_URL` — Database connection string
- `BETTER_AUTH_SECRET` — Authentication secret

```bash
npm run build
npm run start
```

## Security

- Never commit `.env` files or credentials to version control
- Use strong, unique values for all secrets in production
- Keep dependencies updated

## License

ISC
