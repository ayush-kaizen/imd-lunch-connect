import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const upcoming = searchParams.get("upcoming") === "true";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: Record<string, any> = {
      OR: [{ hostId: userId }, { bookerId: userId }],
    };

    if (status) {
      whereClause.status = status;
    }

    if (upcoming) {
      whereClause.slot = {
        date: { gte: new Date() },
      };
      whereClause.status = "CONFIRMED";
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        slot: true,
        host: true,
        booker: true,
      },
      orderBy: {
        slot: { date: upcoming ? "asc" : "desc" },
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("GET /api/bookings/me error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
