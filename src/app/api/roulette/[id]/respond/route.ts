import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { z } from "zod";

const responseSchema = z.object({
  response: z.enum(["ACCEPTED", "DECLINED"]),
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

    const match = await prisma.rouletteMatch.findUnique({
      where: { id },
      include: {
        user1: true,
        user2: true,
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // Check if user is part of this match
    const isUser1 = match.user1Id === userId;
    const isUser2 = match.user2Id === userId;

    if (!isUser1 && !isUser2) {
      return NextResponse.json(
        { error: "Not authorized to respond to this match" },
        { status: 403 }
      );
    }

    // Check if already responded
    const myCurrentStatus = isUser1 ? match.user1Status : match.user2Status;
    if (myCurrentStatus !== "PENDING") {
      return NextResponse.json(
        { error: "You have already responded to this match" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { response } = responseSchema.parse(body);

    // Update the user's status
    const updateData = isUser1
      ? { user1Status: response }
      : { user2Status: response };

    // Get the other user's status
    const otherStatus = isUser1 ? match.user2Status : match.user1Status;

    // Determine overall match status
    let overallStatus = match.status;
    if (response === "DECLINED") {
      overallStatus = "DECLINED";
    } else if (response === "ACCEPTED" && otherStatus === "ACCEPTED") {
      overallStatus = "CONFIRMED";
    }

    const updatedMatch = await prisma.rouletteMatch.update({
      where: { id },
      data: {
        ...updateData,
        status: overallStatus,
      },
      include: {
        user1: true,
        user2: true,
      },
    });

    return NextResponse.json(updatedMatch);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("PUT /api/roulette/[id]/respond error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
