import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { differenceInHours, parse, format } from "date-fns";
import { CANCELLATION_WINDOW_HOURS } from "@/lib/constants";
import { notifyBookingCancelled } from "@/lib/notifications";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        slot: true,
        host: true,
        booker: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check if user is host or booker
    if (booking.hostId !== userId && booking.bookerId !== userId) {
      return NextResponse.json(
        { error: "Not authorized to cancel this booking" },
        { status: 403 }
      );
    }

    if (booking.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "This booking cannot be cancelled" },
        { status: 400 }
      );
    }

    // Check cancellation window (2 hours before)
    const dateStr = format(booking.slot.date, "yyyy-MM-dd");
    const slotDateTime = parse(
      `${dateStr} ${booking.slot.startTime}`,
      "yyyy-MM-dd HH:mm",
      new Date()
    );

    const hoursUntilSlot = differenceInHours(slotDateTime, new Date());

    if (hoursUntilSlot < CANCELLATION_WINDOW_HOURS) {
      return NextResponse.json(
        {
          error: `Cannot cancel within ${CANCELLATION_WINDOW_HOURS} hours of the meeting`,
        },
        { status: 400 }
      );
    }

    // Cancel booking and free up slot
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancelledBy: userId,
        },
      });

      await tx.slot.update({
        where: { id: booking.slotId },
        data: { isBooked: false },
      });
    });

    // Send cancellation notifications
    try {
      await notifyBookingCancelled(booking, userId);
    } catch (notifyError) {
      console.error("Failed to send cancellation notification:", notifyError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/bookings/[id]/cancel error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
