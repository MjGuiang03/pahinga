# Pahinga 🏔️

Adventure booking platform for hiking trails across the Philippines.

## Tech Stack

- **Frontend:** React 19, Next.js 16 (App Router), Tailwind CSS 3
- **Backend:** Next.js API Routes, MongoDB, Mongoose
- **Auth:** JWT (httpOnly cookies), bcryptjs
- **UI:** Lucide icons, Sonner toasts, Recharts

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local

# Seed admin account
node scripts/seed-admin.js

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (main)/             # Public pages (header + footer)
│   ├── (admin)/            # Admin panel (sidebar)
│   ├── (agency)/           # Agency panel (sidebar)
│   └── api/                # Backend API routes
├── frontend/               # React components, hooks
│   ├── components/layout/
│   └── hooks/
└── backend/                # Server-side code
    ├── lib/                # DB connection, auth helpers
    └── models/             # Mongoose schemas
```

## Default Admin

- **Email:** admin@pahinga.com
- **Password:** admin123
