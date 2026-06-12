import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  // Verify cron secret (optional for local demo)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Expire "Available Today" flags that have passed their expiry time
    const result = await prisma.user.updateMany({
      where: {
        isAvailableToday: true,
        availableTodayExpiresAt: {
          lt: now,
        },
      },
      data: {
        isAvailableToday: false,
        availableTodayExpiresAt: null,
      },
    });

    console.log(`[CRON] Expired availability for ${result.count} users`);

    return NextResponse.json({
      success: true,
      message: `Expired availability for ${result.count} users`,
    });
  } catch (error) {
    console.error("Cron expire-availability error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
