# ThemeVN - WordPress Themes Marketplace

## Overview
ThemeVN is a Vietnamese WordPress theme marketplace platform that allows users to browse, purchase, and download premium WordPress themes. The platform includes features like user authentication with OTP, admin dashboard, order management, coupon system, support tickets, email templates, and affiliate program functionality.

## Recent Changes
- **2026-01-31**: Added MySQL database support for standalone deployment outside of Replit
- **2026-01-31**: Migrated from Supabase to self-hosted authentication with Express session
- **2026-01-31**: Created autoinstall.sh script for easy VPS deployment

## Project Architecture

### Frontend (React + Vite)
- **Location**: `src/`
- **Framework**: React 18 with React Router DOM
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state
- **Authentication**: Context-based auth using session cookies

### Backend (Express.js)
- **Location**: `server/`
- **Framework**: Express.js 5.x
- **Authentication**: Express sessions with bcrypt password hashing
- **Session Store**: Memory store (development) / Connect-pg-simple (production)

### Database
- **ORM**: Drizzle ORM
- **PostgreSQL** (Replit environment): Default database
- **MySQL** (Standalone deployment): Supported via `DB_TYPE=mysql`
- **Schema**: `shared/schema.ts` (PostgreSQL), `shared/schema-mysql.ts` (MySQL)

### Key Files
- `server/index.ts` - Express server entry point
- `server/routes.ts` - API route definitions
- `server/storage.ts` - Database operations layer
- `server/db.ts` - Database connection (supports both PostgreSQL and MySQL)
- `shared/schema.ts` - PostgreSQL Drizzle schema
- `shared/schema-mysql.ts` - MySQL Drizzle schema
- `drizzle.config.ts` - Drizzle Kit configuration

## Database Configuration

### For Replit (PostgreSQL - Default)
No additional configuration needed. Uses `DATABASE_URL` environment variable automatically.

### For Standalone Deployment (MySQL)
Set the following environment variables:
```env
DB_TYPE=mysql
DATABASE_URL=mysql://username:password@localhost:3306/themevn
```

## Deployment

### Replit Deployment
1. The application runs automatically on port 5000
2. Use `npm run dev` for development
3. Use `npm run build` for production build

### Standalone VPS Deployment (MySQL)
1. Copy the project to your VPS
2. Run the autoinstall script:
```bash
cd scripts
chmod +x autoinstall.sh
sudo ./autoinstall.sh
```

The script will:
- Install Node.js 20.x and MySQL
- Create the database and user
- Configure environment variables
- Build the application
- Set up Nginx and systemd service
- Optionally configure SSL with Let's Encrypt

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/send-otp` - Send OTP email
- `POST /api/auth/verify-otp` - Verify OTP and login/signup
- `POST /api/auth/reset-password` - Reset password

### Themes
- `GET /api/themes` - List all themes
- `GET /api/themes/:id` - Get theme by ID
- `POST /api/themes` - Create theme (admin)
- `PUT /api/themes/:id` - Update theme (admin)
- `DELETE /api/themes/:id` - Delete theme (admin)

### Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order

### Admin
- `GET /api/admin/users` - List users
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings

## User Preferences
- Vietnamese language interface ("ThemeVN - Premium WordPress Themes")
- Dark mode support
- Session-based authentication

## Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio
