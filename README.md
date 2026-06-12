# IMD Lunch Connect

A lunch networking platform for IMD Business School community (~400-500 users pilot).

## Overview

IMD Lunch Connect helps faculty, staff, and MBA students connect over lunch meetings. Book lunch slots, discover available colleagues, and get randomly matched through the Lunch Roulette feature.

**This is a LOCAL DEMO version** - No external services required.

## Features

- **Dashboard** - Overview of upcoming meetings and stats
- **Browse People** - Search and filter colleagues by role, interests
- **My Availability** - Set lunch/coffee chat slots
- **Available Today** - Toggle visibility for spontaneous meetings
- **Lunch Roulette** - Spinning wheel for random colleague matching
- **Past Meetings** - History of completed meetings

## Quick Start

```bash
# Install dependencies
npm install

# Set up database
npx prisma db push

# Seed sample data (31 users, 150+ slots)
npx prisma db seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Login

This is a demo version with no password authentication. Select any user from the dropdown to log in:

- **Default**: Ayush Bansal (Staff)
- **19 Faculty** including David Bach, Howard Yu, Julia Binder
- **6 Staff** members
- **6 MBA Students**

Use the **Switch User** button in the sidebar to change users.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | SQLite (via Prisma) |
| Auth | Cookie-based session |
| Styling | Tailwind CSS + shadcn/ui |
| Font | Inter |

## Project Structure

```
imd-lunch-connect/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── dev.db             # SQLite database
│   └── seed.ts            # Seed data (31 users)
├── src/
│   ├── app/
│   │   ├── page.tsx       # Login page
│   │   ├── (dashboard)/   # Protected routes
│   │   └── api/           # API routes
│   ├── components/
│   │   ├── ui/            # shadcn components
│   │   ├── layout/        # Header, Sidebar
│   │   └── roulette/      # Wheel canvas
│   └── lib/               # Utilities
├── CLAUDE.md              # AI assistant context
└── README.md              # This file
```

## Database Commands

```bash
npx prisma studio              # Open database GUI
npx prisma db push             # Push schema changes
npx prisma db seed             # Re-seed data
npx prisma db push --force-reset  # Reset database
```

## Business Rules

### Booth Assignment
- 5 booths available in "The Hub"
- Auto-assigned at booking (lowest available)
- Checks time overlap conflicts

### Roulette Matching
- Users must opt-in
- Excludes last 4 weeks of matches
- Both parties must accept

### Cancellation
- Cannot cancel within 2 hours
- Slot freed for rebooking

## Environment

**Zero external services required:**

- SQLite database (not PostgreSQL)
- Cookie-based auth (not Clerk)
- In-app notifications (not Resend email)

## IMD Branding

| Element | Value |
|---------|-------|
| Primary | Navy #00205B |
| Secondary | Teal #0F6E56 |
| Font | Inter |
| Avatars | Blue tones only |
| Wheel | Blues/Navy only |

## Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm run start
```

For Vercel deployment, add `vercel.json`:
```json
{
  "buildCommand": "npx prisma generate && npm run build",
  "installCommand": "npm install"
}
```

## License

Internal IMD project.
