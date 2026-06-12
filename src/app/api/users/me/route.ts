import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { z } from "zod";

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  bio: z.string().optional(),
  title: z.string().optional(),
  role: z.enum(["FACULTY", "STAFF", "MBA_STUDENT"]).optional(),
  department: z.string().optional(),
  pastExperience: z.string().optional(),
  currentlyReading: z.string().optional(),
  researchWork: z.string().optional(),
  funFact: z.string().optional(),
  interests: z.array(z.string()).max(10).optional(),
});

export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { interests: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET /api/users/me error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update interests if provided
    if (validatedData.interests) {
      // Delete existing interests
      await prisma.userInterestTag.deleteMany({
        where: { userId: user.id },
      });

      // Create new interests
      await prisma.userInterestTag.createMany({
        data: validatedData.interests.map((tag) => ({
          userId: user.id,
          tag,
        })),
      });
    }

    // Update user profile
    const { interests, ...userData } = validatedData;
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: userData,
      include: { interests: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("PUT /api/users/me error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
