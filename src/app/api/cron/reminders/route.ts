import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addDays, startOfDay, endOfDay, format } from "date-fns";
import { createNotification } from "@/lib/notifications";

export async function GET(request: NextRequest) {
  // Verify cron secret (optional for local demo)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tomorrow = addDays(new Date(), 1);
    const tomorrowStart = startOfDay(tomorrow);
    const tomorrowEnd = endOfDay(tomorrow);

    // Get all confirmed bookings for tomorrow
    const bookings = await prisma.booking.findMany({
      where: {
        status: "CONFIRMED",
        slot: {
          date: {
            gte: tomorrowStart,
            lte: tomorrowEnd,
          },
        },
      },
      include: {
        slot: true,
        host: true,
        booker: true,
      },
    });

    let sentCount = 0;

    for (const booking of bookings) {
      const dateStr = format(booking.slot.date, "EEEE, MMMM d");
      const timeStr = `${booking.slot.startTime} - ${booking.slot.endTime}`;
      const boothStr = booking.boothNumber ? `Booth ${booking.boothNumber}` : "the Hub";

      try {
        // Notify host
        await createNotification({
          userId: booking.hostId,
          type: "BOOKING_REMINDER",
          title: `Reminder: Lunch tomorrow with ${booking.booker.firstName}`,
          message: `Don't forget your lunch meeting with ${booking.booker.firstName} ${booking.booker.lastName} tomorrow (${dateStr}) at ${timeStr} in ${boothStr}.`,
          relatedBookingId: booking.id,
        });

        // Notify booker
        await createNotification({
          userId: booking.bookerId,
          type: "BOOKING_REMINDER",
          title: `Reminder: Lunch tomorrow with ${booking.host.firstName}`,
          message: `Don't forget your lunch meeting with ${booking.host.firstName} ${booking.host.lastName} tomorrow (${dateStr}) at ${timeStr} in ${boothStr}.`,
          relatedBookingId: booking.id,
        });

        sentCount += 2;
      } catch (notifyError) {
        console.error(`Failed to send reminder for booking ${booking.id}:`, notifyError);
      }
    }

    console.log(`[CRON] Sent ${sentCount} reminders for ${bookings.length} bookings`);

    return NextResponse.json({
      success: true,
      message: `Sent ${sentCount} reminder notifications for ${bookings.length} bookings`,
    });
  } catch (error) {
    console.error("Cron reminders error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
