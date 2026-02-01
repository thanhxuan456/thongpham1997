# ThemeVN - WordPress Themes Marketplace

## Overview
ThemeVN is a Vietnamese WordPress theme marketplace platform that allows users to browse, purchase, and download premium WordPress themes. The platform includes features like user authentication with OTP, admin dashboard, order management, coupon system, support tickets, email templates, and affiliate program functionality.

## Recent Changes
- **2026-02-01**: Added WordPress-style web installer at `/setup` for easy CMS installation
- **2026-02-01**: Improved OTP validation (login requires registered users, signup requires new users)
- **2026-02-01**: Enhanced autoinstall.sh with PostgreSQL support and admin user creation
- **2026-01-31**: Added SMTP email service with Nodemailer for VPS deployment
- **2026-01-31**: Added phone number OTP support with country code selector
- **2026-01-31**: Created comprehensive development guide (`docs/DEVELOPMENT_GUIDE.md`)
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

## Web Installer

ThemeVN includes a WordPress-style web installer at `/setup` that allows you to:

1. **Configure Database**: Test connection or create new database (MySQL/PostgreSQL)
2. **Create Admin**: Set up the first administrator account
3. **Configure Site**: Set site name, URL, and SMTP settings
4. **Complete Installation**: Auto-deletes installer files for security

**Security Features:**
- Input sanitization to prevent SQL injection
- Installer files (`server/installer.ts`, `src/pages/Setup.tsx`) are automatically deleted after successful installation
- Installation lock file (`.installed`) prevents re-running

### Installer API Endpoints
- `GET /api/install/status` - Check installation status
- `POST /api/install/test-database` - Test database connection
- `POST /api/install/create-database` - Create database with root credentials
- `POST /api/install/create-admin` - Create admin user
- `POST /api/install/configure-site` - Save site configuration
- `POST /api/install/complete` - Mark installation complete

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
