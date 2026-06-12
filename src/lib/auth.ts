import { cookies } from "next/headers";
import { prisma } from "./prisma";

const USER_COOKIE_NAME = "imd-user-id";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(USER_COOKIE_NAME)?.value;

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { interests: true },
  });

  return user;
}

export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(USER_COOKIE_NAME)?.value || null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export function getUserIdFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const userCookie = cookies.find((c) => c.startsWith(`${USER_COOKIE_NAME}=`));

  if (!userCookie) return null;

  return userCookie.split("=")[1] || null;
}
