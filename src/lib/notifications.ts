import { prisma } from "./prisma";
import { format } from "date-fns";

type NotificationType =
  | "BOOKING_CONFIRMED"
  | "BOOKING_CANCELLED"
  | "BOOKING_REMINDER"
  | "ROULETTE_MATCH";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedBookingId?: string;
  relatedRouletteId?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  const { userId, type, title, message, relatedBookingId, relatedRouletteId } = params;

  // Get user email for console log
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, firstName: true },
  });

  // Log mock email to console
  console.log("\n" + "=".repeat(60));
  console.log("📧 MOCK EMAIL SENT");
  console.log("=".repeat(60));
  console.log(`To: ${user?.email}`);
  console.log(`Subject: ${title}`);
  console.log(`Body: ${message}`);
  console.log("=".repeat(60) + "\n");

  // Create in-app notification
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      relatedBookingId,
      relatedRouletteId,
    },
  });

  return notification;
}

export async function notifyBookingConfirmed(booking: {
  id: string;
  hostId: string;
  bookerId: string;
  boothNumber: number;
  slot: {
    date: Date;
    startTime: string;
    endTime: string;
  };
  host: { firstName: string; lastName: string };
  booker: { firstName: string; lastName: string };
}) {
  const dateStr = format(booking.slot.date, "EEEE, MMMM d, yyyy");
  const timeStr = `${booking.slot.startTime} - ${booking.slot.endTime}`;

  // Notify host
  await createNotification({
    userId: booking.hostId,
    type: "BOOKING_CONFIRMED",
    title: `Lunch confirmed with ${booking.booker.firstName} ${booking.booker.lastName}`,
    message: `Your lunch meeting is scheduled for ${dateStr} at ${timeStr}. You'll meet at Booth ${booking.boothNumber} in the Hub. Calendar invite attached.`,
    relatedBookingId: booking.id,
  });

  // Notify booker
  await createNotification({
    userId: booking.bookerId,
    type: "BOOKING_CONFIRMED",
    title: `Lunch confirmed with ${booking.host.firstName} ${booking.host.lastName}`,
    message: `Your lunch meeting is scheduled for ${dateStr} at ${timeStr}. You'll meet at Booth ${booking.boothNumber} in the Hub. Calendar invite attached.`,
    relatedBookingId: booking.id,
  });
}

export async function notifyBookingCancelled(
  booking: {
    id: string;
    hostId: string;
    bookerId: string;
    slot: {
      date: Date;
      startTime: string;
    };
    host: { firstName: string; lastName: string };
    booker: { firstName: string; lastName: string };
  },
  cancelledByUserId: string
) {
  const dateStr = format(booking.slot.date, "EEEE, MMMM d");
  const cancelledByHost = cancelledByUserId === booking.hostId;

  const otherUserId = cancelledByHost ? booking.bookerId : booking.hostId;
  const cancellerName = cancelledByHost
    ? `${booking.host.firstName} ${booking.host.lastName}`
    : `${booking.booker.firstName} ${booking.booker.lastName}`;

  await createNotification({
    userId: otherUserId,
    type: "BOOKING_CANCELLED",
    title: "Lunch meeting cancelled",
    message: `${cancellerName} has cancelled your lunch meeting on ${dateStr} at ${booking.slot.startTime}. The slot is now available for others to book.`,
    relatedBookingId: booking.id,
  });
}

export async function notifyRouletteMatch(
  matchId: string,
  user1: { id: string; firstName: string; lastName: string },
  user2: { id: string; firstName: string; lastName: string }
) {
  // Notify user1
  await createNotification({
    userId: user1.id,
    type: "ROULETTE_MATCH",
    title: `Lunch Roulette: You matched with ${user2.firstName}!`,
    message: `The wheel has spoken! You've been matched with ${user2.firstName} ${user2.lastName} for this week's lunch. Check your Lunch Roulette page to accept or decline.`,
    relatedRouletteId: matchId,
  });

  // Notify user2
  await createNotification({
    userId: user2.id,
    type: "ROULETTE_MATCH",
    title: `Lunch Roulette: You matched with ${user1.firstName}!`,
    message: `The wheel has spoken! You've been matched with ${user1.firstName} ${user1.lastName} for this week's lunch. Check your Lunch Roulette page to accept or decline.`,
    relatedRouletteId: matchId,
  });
}
