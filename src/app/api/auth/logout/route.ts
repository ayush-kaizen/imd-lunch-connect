import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const USER_COOKIE_NAME = "imd-user-id";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(USER_COOKIE_NAME);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
