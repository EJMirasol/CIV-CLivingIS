# Church Living Information System (CIV-CLivingIS)

A comprehensive event management system for Young People's Christian Living (YPCL) conferences and Summer School of Truth (SSOT), built with React Router v7, Prisma, and Better Auth. This full-stack application streamlines participant registration, accommodation management, group assignments, finance tracking, and event administration.

## 🌟 Features

### Conference Management
- 👥 **YP Church Living Registration** — Complete registration system for young people with profiles, health info, and check-in
- 📝 **SSOT Registration** — Public-facing Summer School of Truth registration (no auth required) with health information
- 🏨 **Accommodation Management** — Room assignments, event types, and accommodation coordination
- 👨‍👩‍👧‍👦 **Group Assignments** — Create, manage, and assign participants to groups with capacity tracking
- ✅ **Check-in System** — Digital check-in with status tracking for both YPCL and SSOT

### Finance
- 💰 **Registration Fee Tracking** — Record payments with conference type filtering
- 📊 **Finance Statistics** — Real-time financial insights and summary reports
- 📋 **Expense Management** — Track event expenses by conference type
- 💵 **Return Changes** — Manage payment returns and adjustments

### Utilities
- 🏷️ **Groups Management** — Create and manage groups used across modules
- 🚪 **Rooms Management** — Room creation, editing, and occupancy tracking
- ⚙️ **Billing Settings** — Configure fees by event type and conference type

### Dashboard & Analytics
- 📊 **Dashboard Analytics** — Real-time insights and event statistics
- 📤 **Data Export** — Export registration, participant, and finance data to Excel

### Technical Features
- 🚀 **Server-side rendering** with React Router v7
- ⚡️ **Hot Module Replacement (HMR)** for rapid development
- 🔐 **Secure authentication** with Better Auth
- 🗄️ **PostgreSQL database** with Prisma ORM
- 📱 **Responsive design** with Tailwind CSS v4
- 🎨 **Modern UI components** with shadcn/ui
- 🔍 **Advanced data tables** with server-side search and pagination
- ✅ **Form validation** using Zod and Conform
- 🔒 **TypeScript** for type safety

## 🏗️ Tech Stack

- **Frontend**: React 19, React Router v7 with SSR
- **Backend**: React Router server-side functions (loaders/actions)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth with session management
- **UI Framework**: shadcn/ui components with Tailwind CSS v4
- **Validation**: Zod with Conform for robust form handling
- **Icons**: Lucide React & React Icons
- **Export**: exceljs for Excel file generation
- **Development**: TypeScript, Vite, tsx

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x
- PostgreSQL database
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/EJMirasol/CIV-CLivingIS.git
   cd CIV-CLivingIS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your database configuration:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/CLIS-db-dev?schema=public"
   BETTER_AUTH_SECRET=your-secret-here
   ```

4. **Database setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push database schema
   npx prisma db push
   
   # Seed database with initial data
   npx prisma db seed
   ```

### Development

Start the development server:

```bash
npm run dev
```

Your application will be available at `http://localhost:3000`.

### Additional Development Commands

```bash
# Type checking
npm run typecheck

# Database management
npx prisma studio          # Open database GUI
npx prisma migrate dev      # Create and apply migrations
npx prisma db push          # Push schema changes
npx prisma db seed          # Seed database with initial data

# Production build
npm run build
npm run start              # Start production server

# Vercel deployment build
npm run vercel-build
```

## 📁 Project Structure

```
app/
├── components/
│   ├── ui/                  # shadcn/ui base components
│   ├── selectbox/           # SelectBoxWithSearch (cmdk-based combobox)
│   ├── shared/              # Reusable components (buttons, dialogs, image upload)
│   │   ├── buttons/         # BackButton, SubmitButton, SaveButton
│   │   ├── dialogs/         # DeleteConfirmationDialog
│   │   └── imageUpload/     # ImageUploader (react-easy-crop)
│   ├── labels/              # LabelNoGap, RequiredIndicator
│   ├── forms/modules/       # Form components organized by domain module
│   ├── layouts/             # Header, Sidebar, MobileMenu
│   └── data-tables/         # DataTable, DataTablePagination, DataTableColumnHeader
├── routes/
│   ├── modules/
│   │   ├── auth/            # Sign-in, Sign-out
│   │   ├── dashboard/       # Dashboard & analytics
│   │   ├── conference-meetings/
│   │   │   ├── church-living/  # YP Church Living (registration, groups, accommodation, export)
│   │   │   └── ssot/           # SSOT (dashboard, registration, export)
│   │   ├── finance/         # Registration fees, expenses, return changes, statistics
│   │   ├── utilities/       # Groups, rooms, billing settings
│   │   └── ssot-registration/  # Public SSOT registration (no auth)
│   └── _layout.tsx          # Protected routes layout with sidebar navigation
├── lib/
│   ├── server/              # Server-side business logic (*.server.ts)
│   ├── auth.server.ts       # Better Auth server configuration
│   ├── auth.client.ts       # Better Auth client (signIn, signOut, signUp, useSession)
│   ├── prisma.ts            # Prisma client instance
│   ├── pagination.ts        # Pagination types and helpers
│   └── utils.ts             # cn(), setSearchParamsString()
├── types/                   # TypeScript types and Zod schemas (*.dto.ts)
├── hooks/                   # Custom React hooks
prisma/
├── schema.prisma            # Database schema
├── migrations/              # Database migrations
└── seed.ts                  # Database seeding
```

## 🏛️ Database Schema

Key models include:

- **YoungPeople** — Participant profiles with personal information
- **Registration** — YP Church Living event registrations with check-in status
- **SsotRegistration** — Summer School of Truth registrations (public)
- **SsotGroupAssignment** — SSOT group assignments
- **Group** — Groups with conference type, capacity tracking, and soft delete
- **Room** — Accommodation rooms with occupancy tracking
- **FinanceRecord** — Payment records linked to registrations
- **Expense** — Event expenses by conference type
- **ReturnChange** — Payment returns and adjustments
- **BillingSetting** — Fee configuration by event and conference type
- **BasicHealthInfo** — Medical conditions, allergies, and medicines
- **User, Account, Session** — Authentication (Better Auth)

Enums: `Gender` (Brother, Sister), `MemberType`, `Locality` (CALOOCAN_CITY, MALABON_CITY, NAVOTAS_CITY, VALENZUELA_CITY), `ConferenceType` (YP_CHURCH_LIVING, CAMANAVA_SSOT)

## 🔐 Authentication

The application uses Better Auth with:
- Email/password authentication
- Session-based authentication (7-day expiry)
- Protected routes with automatic redirects to `/sign-in`
- Public routes: `/ssot-registration` (no auth required)

## 🌐 Deployment

### Vercel (Primary)

The project is configured for Vercel deployment:

```bash
npm run vercel-build    # Runs migrate + generate + build
```

Ensure Vercel environment variables are set:
- `DATABASE_URL` — PostgreSQL connection string
- `BETTER_AUTH_SECRET` — Auth session secret
- `PRODUCTION_URL` — Production URL for auth trusted origins

### Manual Deployment

```bash
npm run build
npm run start
```

Ensure your production environment has:
- Node.js 20.x
- PostgreSQL database
- Environment variables configured (`DATABASE_URL`, `BETTER_AUTH_SECRET`)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React Router v7](https://reactrouter.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database management with [Prisma](https://prisma.io/)
- Authentication powered by [Better Auth](https://better-auth.com/)

---

**CIV-CLivingIS** - Streamlining conference management for Young People's Christian Living events.
