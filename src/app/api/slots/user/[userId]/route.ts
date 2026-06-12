import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;

    const searchParams = request.nextUrl.searchParams;
    const dateStr = searchParams.get("date");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: Record<string, any> = {
      hostId: userId,
      isBooked: false,
      date: { gte: new Date() },
    };

    if (dateStr) {
      whereClause.date = new Date(dateStr);
    }

    const slots = await prisma.slot.findMany({
      where: whereClause,
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json(slots);
  } catch (error) {
    console.error("GET /api/slots/user/[userId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
