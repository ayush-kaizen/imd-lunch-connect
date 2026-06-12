import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { z } from "zod";

const toggleSchema = z.object({
  isRouletteOptedIn: z.boolean(),
});

export async function PUT(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { isRouletteOptedIn } = toggleSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isRouletteOptedIn },
    });

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("PUT /api/users/me/roulette-optin error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
