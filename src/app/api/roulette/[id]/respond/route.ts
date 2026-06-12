import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { ResponseStatus, MatchStatus } from "@prisma/client";
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
    if (myCurrentStatus !== ResponseStatus.PENDING) {
      return NextResponse.json(
        { error: "You have already responded to this match" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { response } = responseSchema.parse(body);

    // Map string to enum
    const responseEnum = response === "ACCEPTED" ? ResponseStatus.ACCEPTED : ResponseStatus.DECLINED;

    // Update the user's status
    const updateData = isUser1
      ? { user1Status: responseEnum }
      : { user2Status: responseEnum };

    // Get the other user's status
    const otherStatus = isUser1 ? match.user2Status : match.user1Status;

    // Determine overall match status
    let overallStatus: MatchStatus = match.status;
    if (responseEnum === ResponseStatus.DECLINED) {
      overallStatus = MatchStatus.DECLINED;
    } else if (responseEnum === ResponseStatus.ACCEPTED && otherStatus === ResponseStatus.ACCEPTED) {
      overallStatus = MatchStatus.CONFIRMED;
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
