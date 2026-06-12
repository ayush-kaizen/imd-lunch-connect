import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { findRouletteMatch, getCurrentWeekMonday, hasMatchThisWeek } from "@/lib/roulette";
import { notifyRouletteMatch } from "@/lib/notifications";

export async function POST() {
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

    if (!user.isRouletteOptedIn) {
      return NextResponse.json(
        { error: "You must opt in to Lunch Roulette first" },
        { status: 400 }
      );
    }

    // Check if user already has a match this week
    const alreadyMatched = await hasMatchThisWeek(userId);
    if (alreadyMatched) {
      return NextResponse.json(
        { error: "You already have a match this week" },
        { status: 400 }
      );
    }

    // Find a match
    const matchResult = await findRouletteMatch(userId);

    if (!matchResult) {
      return NextResponse.json(
        { error: "No eligible matches found. Try again later!" },
        { status: 404 }
      );
    }

    // Create the match
    const weekMonday = getCurrentWeekMonday();
    const match = await prisma.rouletteMatch.create({
      data: {
        user1Id: userId,
        user2Id: matchResult.user.id,
        weekOf: weekMonday,
        matchedSlotId: matchResult.slot?.id,
      },
      include: {
        user1: true,
        user2: true,
      },
    });

    // Send notifications
    try {
      await notifyRouletteMatch(match.id, match.user1, match.user2);
    } catch (notifyError) {
      console.error("Failed to send roulette match notifications:", notifyError);
    }

    return NextResponse.json({
      matchId: match.id,
      matchedUser: matchResult.user,
      suggestedSlot: matchResult.slot,
      interestOverlap: matchResult.interestOverlap,
    });
  } catch (error) {
    console.error("POST /api/roulette/spin error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
