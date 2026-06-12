// IMD Brand Colors
export const COLORS = {
  navy: "#00205B",
  navyHover: "#185FA5",
  teal: "#0F6E56",
  tealLight: "#E1F5EE",
  white: "#FFFFFF",
  bgLight: "#F8F9FA",
  textPrimary: "#1A1A1A",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
  border: "#E5E7EB",
};

// Avatar colors (blues only)
export const AVATAR_COLORS = [
  { bg: "#E6F1FB", text: "#0C447C" },
  { bg: "#D1E8FF", text: "#185FA5" },
  { bg: "#B5D4F4", text: "#042C53" },
  { bg: "#E0EDF9", text: "#00205B" },
  { bg: "#C5DCF2", text: "#0C447C" },
  { bg: "#A8C9E8", text: "#042C53" },
];

// Roulette wheel colors (blues and navy only)
export const ROULETTE_COLORS = [
  "#00205B", // navy
  "#185FA5", // navy hover
  "#0C447C", // dark blue
  "#378ADD", // medium blue
  "#042C53", // very dark blue
  "#0F6E56", // teal accent
  "#1E5A99", // another blue
  "#2B6CB0", // blue
];

// Standardized interest tags
export const INTEREST_TAGS = [
  "Leadership",
  "Sustainability",
  "AI & Digital",
  "Strategy",
  "Innovation",
  "Finance",
  "Governance",
  "Geopolitics",
  "Family Business",
  "Supply Chain",
  "Negotiation",
  "Marketing",
  "Entrepreneurship",
  "Organizational Behavior",
  "Economics",
  "Coaching",
  "DEI",
  "Data & Analytics",
  "Change Management",
  "Healthcare",
  "Energy",
  "Startups",
  "Luxury",
  "Communication",
  "Consulting",
  "Fintech",
  "Circular Economy",
  "Education",
  "Globalization",
  "Emerging Markets",
  "Operations",
  "Culture",
  "Research",
  "Hospitality",
  "Future Readiness",
  "Cybersecurity",
  "Accounting",
];

// Time slots
export const TIME_SLOTS = [
  { start: "11:45", end: "12:45", duration: 60, label: "11:45 AM - 12:45 PM", type: "LUNCH" },
  { start: "12:00", end: "13:00", duration: 60, label: "12:00 PM - 1:00 PM", type: "LUNCH" },
  { start: "12:30", end: "13:30", duration: 60, label: "12:30 PM - 1:30 PM", type: "LUNCH" },
  { start: "13:00", end: "14:00", duration: 60, label: "1:00 PM - 2:00 PM", type: "LUNCH" },
  { start: "15:00", end: "15:30", duration: 30, label: "3:00 PM - 3:30 PM", type: "COFFEE_CHAT" },
  { start: "15:30", end: "16:00", duration: 30, label: "3:30 PM - 4:00 PM", type: "COFFEE_CHAT" },
  { start: "16:00", end: "16:30", duration: 30, label: "4:00 PM - 4:30 PM", type: "COFFEE_CHAT" },
];

// Duration options
export const DURATION_OPTIONS = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "60 minutes" },
];

// Maximum booths available
export const MAX_BOOTHS = 5;

// Cancellation window in hours
export const CANCELLATION_WINDOW_HOURS = 2;

// Roulette match exclusion weeks
export const ROULETTE_EXCLUSION_WEEKS = 4;

// Available Today expiry time
export const AVAILABLE_TODAY_EXPIRY_HOUR = 13;
export const AVAILABLE_TODAY_EXPIRY_MINUTE = 45;

// User roles with labels
export const USER_ROLES = {
  FACULTY: { label: "Faculty", description: "IMD Professors and Instructors" },
  STAFF: { label: "Staff", description: "IMD Administrative Staff" },
  MBA_STUDENT: { label: "MBA Student", description: "Current MBA Participants" },
};

// Days of the week
export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
