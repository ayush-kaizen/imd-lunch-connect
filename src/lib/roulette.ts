import { prisma } from "./prisma";
import { startOfWeek, subWeeks, addDays } from "date-fns";
import { ROULETTE_EXCLUSION_WEEKS } from "./constants";

interface RouletteCandidate {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhotoUrl: string | null;
    role: string;
    department: string | null;
    title: string | null;
  };
  slot: {
    id: string;
    date: Date;
    startTime: string;
    endTime: string;
  } | null;
  interestOverlap: number;
}

/**
 * Finds a roulette match for a user.
 * Excludes users matched in the last 4 weeks.
 * Optionally weights by interest overlap.
 */
export async function findRouletteMatch(
  userId: string
): Promise<RouletteCandidate | null> {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const cutoffDate = subWeeks(weekStart, ROULETTE_EXCLUSION_WEEKS);

  // Get the current user with interests
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { interests: true },
  });

  if (!currentUser) {
    return null;
  }

  const userInterests = currentUser.interests.map((i) => i.tag);

  // Get users matched in the exclusion period
  const recentMatches = await prisma.rouletteMatch.findMany({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
      weekOf: {
        gte: cutoffDate,
      },
    },
    select: {
      user1Id: true,
      user2Id: true,
    },
  });

  const excludedUserIds = new Set<string>();
  excludedUserIds.add(userId); // Exclude self

  recentMatches.forEach((match) => {
    excludedUserIds.add(match.user1Id);
    excludedUserIds.add(match.user2Id);
  });

  // Find eligible users who have opted in to roulette
  const eligibleUsers = await prisma.user.findMany({
    where: {
      id: {
        notIn: Array.from(excludedUserIds),
      },
      isRouletteOptedIn: true,
    },
    include: {
      interests: true,
      slotsAsHost: {
        where: {
          isBooked: false,
          date: {
            gte: today,
            lte: addDays(today, 14), // Next 2 weeks
          },
        },
        orderBy: {
          date: "asc",
        },
        take: 1,
      },
    },
  });

  if (eligibleUsers.length === 0) {
    return null;
  }

  // Score users by interest overlap and weight randomly
  const candidates: RouletteCandidate[] = eligibleUsers.map((user) => {
    const theirInterests = user.interests.map((i) => i.tag);
    const overlap = userInterests.filter((i) => theirInterests.includes(i)).length;

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePhotoUrl: user.profilePhotoUrl,
        role: user.role,
        department: user.department,
        title: user.title,
      },
      slot: user.slotsAsHost[0]
        ? {
            id: user.slotsAsHost[0].id,
            date: user.slotsAsHost[0].date,
            startTime: user.slotsAsHost[0].startTime,
            endTime: user.slotsAsHost[0].endTime,
          }
        : null,
      interestOverlap: overlap,
    };
  });

  // Weighted random selection (higher overlap = higher chance)
  const totalWeight = candidates.reduce(
    (sum, c) => sum + (c.interestOverlap + 1), // +1 so everyone has a chance
    0
  );

  let random = Math.random() * totalWeight;

  for (const candidate of candidates) {
    random -= candidate.interestOverlap + 1;
    if (random <= 0) {
      return candidate;
    }
  }

  // Fallback to last candidate
  return candidates[candidates.length - 1];
}

/**
 * Gets the current week's Monday date for roulette matching.
 */
export function getCurrentWeekMonday(): Date {
  return startOfWeek(new Date(), { weekStartsOn: 1 });
}

/**
 * Checks if user already has a match for the current week.
 */
export async function hasMatchThisWeek(userId: string): Promise<boolean> {
  const weekStart = getCurrentWeekMonday();

  const existingMatch = await prisma.rouletteMatch.findFirst({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
      weekOf: weekStart,
    },
  });

  return !!existingMatch;
}
