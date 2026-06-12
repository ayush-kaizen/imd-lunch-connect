import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { z } from "zod";
import { assignBooth } from "@/lib/booth";
import { notifyBookingConfirmed } from "@/lib/notifications";

const createBookingSchema = z.object({
  slotId: z.string(),
  talkingPoints: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { slotId, talkingPoints } = createBookingSchema.parse(body);

    // Get the slot
    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      include: { host: true },
    });

    if (!slot) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    if (slot.isBooked) {
      return NextResponse.json(
        { error: "This slot is already booked" },
        { status: 400 }
      );
    }

    if (slot.hostId === user.id) {
      return NextResponse.json(
        { error: "You cannot book your own slot" },
        { status: 400 }
      );
    }

    // Assign booth (defaults to booth 1 if all are occupied)
    const boothNumber = await assignBooth(
      slot.date,
      slot.startTime,
      slot.endTime
    ) ?? 1;

    // Create booking and update slot
    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          slotId,
          hostId: slot.hostId,
          bookerId: user.id,
          boothNumber,
          bookerTalkingPoints: talkingPoints,
        },
        include: {
          slot: true,
          host: true,
          booker: true,
        },
      });

      await tx.slot.update({
        where: { id: slotId },
        data: { isBooked: true },
      });

      return newBooking;
    });

    // Send notifications (mock email + in-app)
    try {
      await notifyBookingConfirmed(booking);
    } catch (notifyError) {
      console.error("Failed to send notifications:", notifyError);
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("POST /api/bookings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
