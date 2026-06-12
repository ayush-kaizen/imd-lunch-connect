import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { z } from "zod";

const updateSlotSchema = z.object({
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  type: z.enum(["LUNCH", "COFFEE_CHAT"]).optional(),
  durationMinutes: z.number().optional(),
});

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

    const slot = await prisma.slot.findUnique({
      where: { id },
    });

    if (!slot) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    if (slot.hostId !== userId) {
      return NextResponse.json(
        { error: "Not authorized to update this slot" },
        { status: 403 }
      );
    }

    if (slot.isBooked) {
      return NextResponse.json(
        { error: "Cannot update a booked slot" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateSlotSchema.parse(body);

    const updatedSlot = await prisma.slot.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(updatedSlot);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("PUT /api/slots/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const slot = await prisma.slot.findUnique({
      where: { id },
    });

    if (!slot) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    if (slot.hostId !== userId) {
      return NextResponse.json(
        { error: "Not authorized to delete this slot" },
        { status: 403 }
      );
    }

    if (slot.isBooked) {
      return NextResponse.json(
        { error: "Cannot delete a booked slot. Cancel the booking first." },
        { status: 400 }
      );
    }

    await prisma.slot.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/slots/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
