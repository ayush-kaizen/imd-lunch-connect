import { User, Slot, Booking, RouletteMatch, UserInterestTag } from "@prisma/client";

// Extended User with relations
export type UserWithInterests = User & {
  interests: UserInterestTag[];
};

export type UserWithSlots = User & {
  interests: UserInterestTag[];
  slotsAsHost: Slot[];
};

// Extended Slot with relations
export type SlotWithHost = Slot & {
  host: User;
};

export type SlotWithBooking = Slot & {
  booking: Booking | null;
};

// Extended Booking with relations
export type BookingWithDetails = Booking & {
  slot: Slot;
  host: User;
  booker: User;
};

// Extended Roulette with relations
export type RouletteMatchWithUsers = RouletteMatch & {
  user1: User;
  user2: User;
};

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Form data types
export interface ProfileFormData {
  firstName: string;
  lastName: string;
  bio: string;
  role: string;
  department: string;
  linkedinUrl: string;
  interests: string[];
}

export interface SlotFormData {
  date: Date;
  startTime: string;
  endTime: string;
  slotType: "LUNCH" | "COFFEE";
  location?: string;
  notes?: string;
}

export interface BookingFormData {
  slotId: string;
  message?: string;
}

// Filter types
export interface UserFilters {
  search?: string;
  role?: string[];
  interests?: string[];
  availableToday?: boolean;
}

// Stats types
export interface DashboardStats {
  upcomingMeetings: number;
  pastMeetings: number;
  slotsAvailable: number;
  rouletteStatus: "opted-out" | "no-match" | "pending" | "accepted";
}
