# IMD Lunch Connect - Design System

This document describes the design system extracted from the mockups.

## Colors

### Backgrounds
- Primary (cards, sidebar): `#FFFFFF`
- Secondary (content area): `#F5F3F0` (warm beige)

### Text
- Primary: `#1A1A1A`
- Secondary: `#6B7280`
- Tertiary: `#9CA3AF`

### Borders
- Default: `#E5E7EB`
- Secondary: `#D1D5DB`

### Brand
- Navy: `#00205B`
- Navy Hover: `#185FA5`
- Navy Light: `#E6F1FB`
- Teal: `#0F6E56`
- Teal Light: `#E1F5EE`

## Typography

- Page headings: `18px`, weight `500`
- Section headings: `14px`, weight `500`
- Card names: `13-14px`, weight `500`
- Body/descriptions: `12-13px`, weight `400`, color secondary
- Small labels: `11-12px`, color tertiary
- Tag pills: `10-11px`
- Stat numbers: `22px`, weight `500`

## Components

### Card
```css
background: #FFFFFF;
border: 0.5px solid #E5E7EB;
border-radius: 8px;
padding: 14px 16px;
```

### Tag Pills
```css
/* Default */
font-size: 10px;
padding: 2px 8px;
background: rgba(0, 32, 91, 0.06);
border-radius: 10px;
color: #6B7280;

/* Active/Selected */
font-size: 11px;
padding: 3px 10px;
background: #00205B;
color: #FFFFFF;
border-radius: 20px;
```

### Filter Pills
```css
font-size: 12px;
padding: 4px 12px;
border-radius: 20px;

/* Active */
background: #00205B;
color: #FFFFFF;

/* Inactive */
background: transparent;
border: 1px solid #E5E7EB;
color: #6B7280;
```

### Avatar Sizes
- Cards: 38-42px
- Roulette match: 52px
- Profile pages: 64px
- Header: 32px

### Avatar Colors (cycle through)
1. `{ bg: '#E6F1FB', fg: '#0C447C' }`
2. `{ bg: '#EEEDFE', fg: '#3C3489' }`
3. `{ bg: '#E1F5EE', fg: '#085041' }`
4. `{ bg: '#FAEEDA', fg: '#633806' }`
5. `{ bg: '#FBEAF0', fg: '#72243E' }`
6. `{ bg: '#FAECE7', fg: '#712B13' }`

## Layout

### Header
- Height: 56px (14 * 4)
- Background: `#00205B`
- Logo: White box with "IMD" text in navy

### Sidebar
- Width: 200px
- Background: `#FFFFFF`
- Border-right: 1px solid `#E5E7EB`
- Active item: Left border accent `3px solid #00205B`, background `rgba(0,32,91,0.06)`

### Content Area
- Background: `#F5F3F0`
- Padding: 20px

## Page-Specific

### Browse People
- 2-column grid
- Card height: ~100px
- No bio text on cards
- Green dot (8px) for "available today"

### Available Today
- Green info banner: `background: #E1F5EE; border: 0.5px solid #5DCAA5`
- List rows instead of cards

### My Availability
- Mon-Fri only (5 columns)
- Slot pills: Navy for lunch, `#85B7EB` for coffee chat
