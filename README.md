# Church Living Information System (CIV-CLivingIS)

A comprehensive event management system for Young People's Christian Living (YPCL) conferences, built with React Router v7, Prisma, and Better Auth. This full-stack application streamlines participant registration, accommodation management, group assignments, and event administration.

## 🌟 Features

### Core Functionality
- 👥 **Participant Management** - Complete registration system for young people with detailed profiles
- 🏨 **Accommodation Management** - Room assignments, event types, and accommodation coordination  
- 👨‍👩‍👧‍👦 **Group Management** - Create, manage, and assign participants to groups
- 📊 **Dashboard Analytics** - Real-time insights and event statistics
- ✅ **Check-in System** - Digital check-in with status tracking
- 📤 **Data Export** - Export registration and participant data
- 🏥 **Health Information** - Medical conditions and emergency contact management

### Technical Features
- 🚀 **Server-side rendering** with React Router v7
- ⚡️ **Hot Module Replacement (HMR)** for rapid development
- 🔐 **Secure authentication** with Better Auth
- 🗄️ **PostgreSQL database** with Prisma ORM
- 📱 **Responsive design** with Tailwind CSS v4
- 🎨 **Modern UI components** with shadcn/ui
- 🔍 **Advanced data tables** with search and pagination
- ✅ **Form validation** using Zod and Conform
- 🔒 **TypeScript** for type safety

## 🏗️ Tech Stack

- **Frontend**: React 19, React Router v7 with SSR
- **Backend**: React Router server-side functions
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth with session management
- **UI Framework**: shadcn/ui components with Tailwind CSS v4
- **Validation**: Zod with Conform for robust form handling
- **Icons**: Lucide React & React Icons
- **Development**: TypeScript, Vite, tsx

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

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

# Production build
npm run build
npm run start              # Start production server
```

## 📁 Project Structure

```
├── app/
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # shadcn/ui base components
│   │   ├── forms/         # Form components by module
│   │   ├── data-tables/   # Advanced table components
│   │   └── layouts/       # Layout components (Header, Sidebar)
│   ├── routes/            # File-based routing
│   │   ├── modules/       # Feature modules
│   │   │   ├── auth/      # Authentication
│   │   │   ├── dashboard/ # Dashboard & analytics
│   │   │   ├── accommodation/ # Room & event management
│   │   │   └── conference-meetings/church-living/ # Main YPCL module
│   │   └── _layout.tsx    # Protected routes layout
│   ├── lib/               # Utilities and configurations
│   │   ├── auth.server.ts # Better Auth configuration
│   │   ├── prisma.ts      # Database client
│   │   └── utils.ts       # Helper functions
│   └── types/             # TypeScript definitions
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── migrations/        # Database migrations
│   └── seed.ts           # Database seeding
└── public/               # Static assets
```

## 🏛️ Database Schema

Key models include:

- **YoungPeople** - Participant profiles with personal information
- **Registration** - Event registrations with check-in status
- **Group** - Group assignments and management
- **Room & Hall** - Accommodation management
- **BasicHealthInfo** - Medical conditions and allergies
- **ContactPersonEmergency** - Emergency contact information

## 🔐 Authentication

The application uses Better Auth with:
- Email/password authentication
- Session-based authentication (7-day expiry)
- Protected routes with automatic redirects
- Secure session management

## 🌐 Deployment

### Docker Deployment

```bash
docker build -t civ-clivingis .
docker run -p 3000:3000 civ-clivingis
```

### Platform Support
- AWS ECS
- Google Cloud Run  
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway
- Vercel
- Netlify

### DIY Deployment

Deploy the built application with Node.js:

```bash
npm run build
npm run start
```

Ensure your production environment has:
- Node.js 18+
- PostgreSQL database
- Environment variables configured

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
