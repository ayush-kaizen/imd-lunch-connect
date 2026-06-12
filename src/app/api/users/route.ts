import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const roles = searchParams.get("roles")?.split(",").filter(Boolean) || [];
    const interests = searchParams.get("interests")?.split(",").filter(Boolean) || [];
    const availableToday = searchParams.get("availableToday") === "true";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: Record<string, any> = {};

    // Search by name
    if (search) {
      whereClause.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { department: { contains: search } },
      ];
    }

    // Filter by roles
    if (roles.length > 0) {
      whereClause.role = { in: roles };
    }

    // Filter by interests
    if (interests.length > 0) {
      whereClause.interests = {
        some: {
          tag: { in: interests },
        },
      };
    }

    // Filter by available today
    if (availableToday) {
      whereClause.isAvailableToday = true;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        interests: true,
        slotsAsHost: {
          where: {
            isBooked: false,
            date: { gte: new Date() },
          },
          take: 1,
        },
      },
      orderBy: [
        { isAvailableToday: "desc" },
        { firstName: "asc" },
      ],
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
