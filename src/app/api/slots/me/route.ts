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
    const month = searchParams.get("month"); // Format: "2024-01"
    const includeBooked = searchParams.get("includeBooked") === "true";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: Record<string, any> = {
      hostId: userId,
    };

    if (month) {
      const [year, monthNum] = month.split("-").map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0);

      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (!includeBooked) {
      whereClause.isBooked = false;
    }

    const slots = await prisma.slot.findMany({
      where: whereClause,
      include: {
        booking: includeBooked
          ? {
              include: {
                booker: true,
              },
            }
          : false,
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json(slots);
  } catch (error) {
    console.error("GET /api/slots/me error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
