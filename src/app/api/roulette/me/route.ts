import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current and past matches
    const matches = await prisma.rouletteMatch.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: {
          include: { interests: true },
        },
        user2: {
          include: { interests: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Transform to show the "other" user in each match
    const transformedMatches = matches.map((match) => {
      const isUser1 = match.user1Id === userId;
      const otherUser = isUser1 ? match.user2 : match.user1;
      const myStatus = isUser1 ? match.user1Status : match.user2Status;
      const otherStatus = isUser1 ? match.user2Status : match.user1Status;

      return {
        id: match.id,
        weekOf: match.weekOf,
        status: match.status,
        myStatus,
        otherStatus,
        boothNumber: match.boothNumber,
        createdAt: match.createdAt,
        matchedUser: {
          id: otherUser.id,
          firstName: otherUser.firstName,
          lastName: otherUser.lastName,
          profilePhotoUrl: otherUser.profilePhotoUrl,
          role: otherUser.role,
          department: otherUser.department,
          title: otherUser.title,
          interests: otherUser.interests,
        },
      };
    });

    return NextResponse.json(transformedMatches);
  } catch (error) {
    console.error("GET /api/roulette/me error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
