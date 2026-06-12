import { prisma } from "./prisma";
import { MAX_BOOTHS } from "./constants";
import { BookingStatus } from "@prisma/client";

/**
 * Assigns the lowest available booth number for a given date and time range.
 * Returns null if all booths are occupied during that time.
 */
export async function assignBooth(
  date: Date,
  startTime: string,
  endTime: string
): Promise<number | null> {
  // Get all bookings for this date that overlap with the requested time
  const existingBookings = await prisma.booking.findMany({
    where: {
      status: BookingStatus.CONFIRMED,
      slot: {
        date: date,
        OR: [
          // Slot starts during the requested time
          {
            startTime: {
              gte: startTime,
              lt: endTime,
            },
          },
          // Slot ends during the requested time
          {
            endTime: {
              gt: startTime,
              lte: endTime,
            },
          },
          // Slot encompasses the requested time
          {
            startTime: {
              lte: startTime,
            },
            endTime: {
              gte: endTime,
            },
          },
        ],
      },
    },
    select: {
      boothNumber: true,
    },
  });

  const occupiedBooths = new Set(
    existingBookings
      .map((b) => b.boothNumber)
      .filter((n): n is number => n !== null)
  );

  // Find the lowest available booth
  for (let booth = 1; booth <= MAX_BOOTHS; booth++) {
    if (!occupiedBooths.has(booth)) {
      return booth;
    }
  }

  return null; // All booths occupied
}

/**
 * Checks if a specific booth is available for a given date and time range.
 */
export async function isBoothAvailable(
  boothNumber: number,
  date: Date,
  startTime: string,
  endTime: string
): Promise<boolean> {
  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      boothNumber,
      status: BookingStatus.CONFIRMED,
      slot: {
        date: date,
        OR: [
          {
            startTime: {
              gte: startTime,
              lt: endTime,
            },
          },
          {
            endTime: {
              gt: startTime,
              lte: endTime,
            },
          },
          {
            startTime: {
              lte: startTime,
            },
            endTime: {
              gte: endTime,
            },
          },
        ],
      },
    },
  });

  return !conflictingBooking;
}
