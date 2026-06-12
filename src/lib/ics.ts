import { createEvent, EventAttributes } from "ics";
import { format, parse } from "date-fns";

interface BookingDetails {
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  location?: string;
  hostName: string;
  bookerName: string;
  boothNumber?: number;
}

/**
 * Generates an ICS calendar file content for a booking.
 */
export async function generateICS(booking: BookingDetails): Promise<string> {
  const dateStr = format(booking.date, "yyyy-MM-dd");

  // Parse start and end times
  const startDateTime = parse(
    `${dateStr} ${booking.startTime}`,
    "yyyy-MM-dd HH:mm",
    new Date()
  );
  const endDateTime = parse(
    `${dateStr} ${booking.endTime}`,
    "yyyy-MM-dd HH:mm",
    new Date()
  );

  const location = booking.boothNumber
    ? `Lunch Booth ${booking.boothNumber}, IMD Campus`
    : booking.location || "IMD Campus";

  const event: EventAttributes = {
    start: [
      startDateTime.getFullYear(),
      startDateTime.getMonth() + 1,
      startDateTime.getDate(),
      startDateTime.getHours(),
      startDateTime.getMinutes(),
    ],
    end: [
      endDateTime.getFullYear(),
      endDateTime.getMonth() + 1,
      endDateTime.getDate(),
      endDateTime.getHours(),
      endDateTime.getMinutes(),
    ],
    title: booking.title,
    description: booking.description,
    location,
    status: "CONFIRMED",
    organizer: { name: "IMD Lunch Connect", email: "lunch@imd.org" },
    attendees: [
      { name: booking.hostName, rsvp: true, partstat: "ACCEPTED" },
      { name: booking.bookerName, rsvp: true, partstat: "ACCEPTED" },
    ],
  };

  return new Promise((resolve, reject) => {
    createEvent(event, (error, value) => {
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    });
  });
}

/**
 * Creates booking details object from booking data.
 */
export function createBookingDetails(
  booking: {
    slot: {
      date: Date;
      startTime: string;
      endTime: string;
      location?: string | null;
    };
    host: {
      firstName: string;
      lastName: string;
    };
    booker: {
      firstName: string;
      lastName: string;
    };
    boothNumber?: number | null;
    message?: string | null;
  }
): BookingDetails {
  const hostName = `${booking.host.firstName} ${booking.host.lastName}`;
  const bookerName = `${booking.booker.firstName} ${booking.booker.lastName}`;

  return {
    title: `Lunch: ${hostName} & ${bookerName}`,
    description: `IMD Lunch Connect meeting between ${hostName} and ${bookerName}.${
      booking.message ? `\n\nNote: ${booking.message}` : ""
    }`,
    date: booking.slot.date,
    startTime: booking.slot.startTime,
    endTime: booking.slot.endTime,
    location: booking.slot.location || undefined,
    hostName,
    bookerName,
    boothNumber: booking.boothNumber || undefined,
  };
}
