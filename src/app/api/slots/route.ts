import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { z } from "zod";

const createSlotSchema = z.object({
  date: z.string().transform((str) => new Date(str)),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  type: z.enum(["LUNCH", "COFFEE_CHAT"]).default("LUNCH"),
  durationMinutes: z.number().default(60),
});

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createSlotSchema.parse(body);

    // Check for overlapping slots
    const existingSlot = await prisma.slot.findFirst({
      where: {
        hostId: userId,
        date: validatedData.date,
        OR: [
          {
            startTime: {
              gte: validatedData.startTime,
              lt: validatedData.endTime,
            },
          },
          {
            endTime: {
              gt: validatedData.startTime,
              lte: validatedData.endTime,
            },
          },
          {
            startTime: {
              lte: validatedData.startTime,
            },
            endTime: {
              gte: validatedData.endTime,
            },
          },
        ],
      },
    });

    if (existingSlot) {
      return NextResponse.json(
        { error: "You already have a slot during this time" },
        { status: 400 }
      );
    }

    const slot = await prisma.slot.create({
      data: {
        ...validatedData,
        hostId: userId,
      },
    });

    return NextResponse.json(slot, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("POST /api/slots error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
