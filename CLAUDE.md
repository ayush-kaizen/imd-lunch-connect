# IMD Lunch Connect

A lunch networking platform for IMD Business School community members.

## Project Overview

This is a **LOCAL DEMO** version of the full-stack Next.js application that enables IMD faculty, staff, and students to connect over lunch meetings.

**Zero External Dependencies** - No Clerk, No Resend, No external database.

## Features

- **Browse & Book**: Find colleagues and book lunch slots
- **Availability Management**: Set your available time slots
- **Lunch Roulette**: Get randomly matched with colleagues via spinning wheel
- **Available Today**: Quick visibility toggle for spontaneous meetups
- **In-App Notifications**: All notifications are handled internally

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16+ (App Router, TypeScript) |
| Auth | Cookie-based session (dropdown login, no passwords) |
| Database | SQLite via Prisma (`file:./dev.db`) |
| Email | Mocked - console logs + in-app Notification model |
| Styling | Tailwind CSS + shadcn/ui |
| Font | Inter |

## Quick Start

```bash
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

Then open http://localhost:3000

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Login page with user dropdown
│   ├── (dashboard)/          # Protected routes with sidebar
│   │   ├── dashboard/        # Main dashboard
│   │   ├── availability/     # Manage your slots
│   │   ├── browse/           # Browse people directory
│   │   ├── profile/          # View/edit profiles
│   │   ├── available-today/  # See who's free today
│   │   ├── roulette/         # Lunch roulette wheel
│   │   └── past-meetings/    # Meeting history
│   └── api/                  # API routes
├── components/
│   ├── ui/                   # shadcn components
│   ├── layout/               # Sidebar, Header
│   └── roulette/             # Roulette wheel canvas
└── lib/                      # Utilities and business logic
```

## Key Commands

```bash
# Development
npm run dev

# Database
npx prisma generate        # Generate Prisma client
npx prisma db push         # Push schema changes
npx prisma studio          # Open database GUI
npx prisma db seed         # Seed with sample data
npx prisma db push --force-reset  # Reset and push schema

# Build
npm run build
npm run start
```

## Database Models

- **User**: Profile data, interests, preferences
- **UserInterestTag**: Tags associated with users
- **Slot**: Available time slots (lunch/coffee)
- **Booking**: Confirmed meetings with booth assignments
- **RouletteMatch**: Weekly random pairings
- **Notification**: In-app notifications

## Seeded Data

- **31 users**: 19 Faculty, 6 Staff, 6 MBA Students
- **~150 availability slots** for next 2 weeks
- **10 sample bookings**
- **3 roulette matches**
- **Default user**: Ayush Bansal (ayush.bansal@imd.org)

## Business Logic

### Booth Assignment
- 5 booths available for lunch meetings
- Auto-assigned based on time slot availability
- Checks for overlapping bookings

### Roulette Matching
- Excludes matches from last 4 weeks
- Weights by interest overlap
- Requires both users to opt-in

### Cancellation Rules
- Cannot cancel within 2 hours of meeting
- Slot becomes available again after cancellation

## IMD Branding

| Color | Hex | Usage |
|-------|-----|-------|
| Navy | #00205B | Primary, header, active states |
| Navy Hover | #185FA5 | Hover states |
| Navy Light | #E6F1FB | Avatar backgrounds |
| Teal | #0F6E56 | CTAs, success states |
| Teal Light | #E1F5EE | Info banners |
| Border | #E5E7EB | Card borders (0.5px) |
| Background | #F5F3F0 | Page background (warm beige) |
| Card BG | #FFFFFF | Cards, sidebar |

### Text Colors
- Primary: `#1A1A1A`
- Secondary: `#6B7280`
- Tertiary: `#9CA3AF`

### Avatar Colors (Cycle through)
1. `#E6F1FB` / `#0C447C`
2. `#EEEDFE` / `#3C3489`
3. `#E1F5EE` / `#085041`
4. `#FAEEDA` / `#633806`
5. `#FBEAF0` / `#72243E`
6. `#FAECE7` / `#712B13`

### Roulette Wheel Colors
- `#00205B`, `#185FA5`, `#0C447C`, `#378ADD`, `#042C53`, `#0F6E56`

### Typography
- Page headings: 18px, weight 500
- Section headings: 14px, weight 500
- Card names: 13-14px, weight 500
- Body text: 12-13px, weight 400
- Tag pills: 10-11px

### Design Reference
See `/mockups/DESIGN_SYSTEM.md` for detailed design system documentation.

## Auth Flow

1. User visits `/` (login page)
2. Selects user from dropdown (grouped by role)
3. Clicks "Continue" → sets `imd-user-id` cookie
4. Redirected to `/dashboard`
5. "Switch User" button in sidebar returns to login

## API Endpoints

### Auth
- `POST /api/auth/login` - Set session cookie
- `POST /api/auth/logout` - Clear session
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - List with filters
- `GET /api/users/[id]` - User by ID
- `PUT /api/users/me` - Update profile
- `PUT /api/users/me/available-today` - Toggle availability
- `PUT /api/users/me/roulette-optin` - Toggle roulette

### Slots
- `GET /api/slots/me` - My slots
- `POST /api/slots` - Create slot
- `DELETE /api/slots/[id]` - Delete slot
- `GET /api/slots/user/[userId]` - User's available slots

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/me` - My bookings
- `PUT /api/bookings/[id]/cancel` - Cancel booking

### Roulette
- `GET /api/roulette/me` - My matches
- `POST /api/roulette/spin` - Generate match
- `PUT /api/roulette/[id]/respond` - Accept/decline

### Notifications
- `GET /api/notifications` - My notifications
- `PUT /api/notifications/mark-all-read` - Mark all read
