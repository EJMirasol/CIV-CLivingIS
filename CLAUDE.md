# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Church Living Information System (CIV-CLivingIS) is a full-stack React Router v7 application for managing conference meetings, registrations, accommodations, and group assignments for young people's events. Built with React Router SSR, Prisma (PostgreSQL), Better Auth, and shadcn/ui components.

## Common Development Commands

### Development
- `npm run dev` - Start development server at http://localhost:3000 (configured in vite.config.ts)
- `npm run typecheck` - Run type checking with React Router typegen and TypeScript compiler
- `npm run build` - Build production application
- `npm run start` - Start production server

### Database
- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema changes to database
- `npx prisma studio` - Open Prisma Studio database GUI
- `npx prisma migrate dev` - Create and apply new migration
- `npx prisma db seed` - Seed database with initial data (uses tsx)

### Testing
- Tests configured with Vitest (`npm run test` if configured)

## Architecture Overview

### Tech Stack
- **Frontend**: React 19, React Router v7 with SSR
- **Backend**: React Router with server-side rendering
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: Better Auth with email/password authentication
- **UI**: shadcn/ui components with Tailwind CSS v4
- **Validation**: Zod with Conform for forms

### Project Structure
```
app/
├── components/          # Reusable UI components
│   ├── dashboard/       # Dashboard-specific components
│   ├── data-tables/     # Table components with pagination
│   ├── forms/           # Form components by module
│   ├── layouts/         # Header, Sidebar, Mobile menu
│   ├── shared/          # Common shared components
│   └── ui/              # shadcn/ui base components
├── contexts/            # React contexts
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and configurations
│   ├── auth.server.ts   # Better Auth server config
│   ├── auth.client.ts   # Better Auth client config
│   └── prisma.ts        # Prisma client instance
├── routes/              # File-based routing
│   ├── modules/         # Feature modules
│   │   ├── auth/        # Authentication routes
│   │   ├── dashboard/   # Dashboard module
│   │   ├── accommodation/  # Accommodation management
│   │   └── conference-meetings/church-living/  # Main YPCL module
│   └── _layout.tsx      # Protected routes layout
├── types/               # TypeScript type definitions
└── routes.ts            # Route configuration
```

### Key Modules
1. **Conference Meetings (YPCL)** - Main registration and management system
2. **Accommodation Management** - Room assignments and event types
3. **Dashboard** - Analytics and overview
4. **Authentication** - Better Auth with session management

### Database Models
- `YoungPeople` - Core participant information
- `Registration` - Event registrations with check-in status
- `Group` - Group assignments and management
- `Hall`, `Room` - Accommodation management
- `Classification`, `GradeLevel` - Categorization systems

### Authentication
- Uses Better Auth with Prisma adapter
- Email/password authentication (no email verification required)
- Session duration: 7 days, updates every 24 hours
- Protected routes use `_layout.tsx` wrapper

### Path Aliases (tsconfig.json)
- `~/` maps to `./app/` directory
- Components: `~/components`, `~/components/ui`
- Utils: `~/lib/utils`, `~/lib`
- Hooks: `~/hooks`

### Environment Setup
- Copy `.env.example` to `.env`
- Configure `DATABASE_URL` for PostgreSQL connection
- Default: `postgresql://postgres:postgres@localhost:5432/CLIS-db-dev?schema=public`

### Component Patterns
- Use shadcn/ui components from `~/components/ui`
- Forms use Conform with Zod validation
- Data tables include pagination and search
- Consistent button patterns (SaveButton, BackButton)
- Mobile-responsive layouts with sidebar navigation

### Development Guidelines
- Always explore and plan before implementing
- Use existing component patterns and conventions
- Follow file-based routing in `routes/modules/`
- Maintain consistent naming conventions
- Use TypeScript strictly with proper typing