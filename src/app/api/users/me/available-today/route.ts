import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { z } from "zod";
import { AVAILABLE_TODAY_EXPIRY_HOUR, AVAILABLE_TODAY_EXPIRY_MINUTE } from "@/lib/constants";

const toggleSchema = z.object({
  isAvailableToday: z.boolean(),
});

export async function PUT(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { isAvailableToday } = toggleSchema.parse(body);

    // Calculate expiry time (today at 1:45 PM)
    let expiresAt: Date | null = null;
    if (isAvailableToday) {
      expiresAt = new Date();
      expiresAt.setHours(AVAILABLE_TODAY_EXPIRY_HOUR, AVAILABLE_TODAY_EXPIRY_MINUTE, 0, 0);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isAvailableToday,
        availableTodayExpiresAt: expiresAt,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("PUT /api/users/me/available-today error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
