import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { format } from "date-fns";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Plus,
  Sparkles,
  Shuffle,
  Armchair,
  Check,
  X,
} from "lucide-react";
import { AvailableTodayToggle } from "./AvailableTodayToggle";
import { USER_ROLES } from "@/lib/constants";

// Avatar colors from mockup
const AVATAR_COLORS = [
  { bg: '#E6F1FB', fg: '#0C447C' },
  { bg: '#EEEDFE', fg: '#3C3489' },
  { bg: '#E1F5EE', fg: '#085041' },
  { bg: '#FAEEDA', fg: '#633806' },
  { bg: '#FBEAF0', fg: '#72243E' },
  { bg: '#FAECE7', fg: '#712B13' },
];

async function getDashboardData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { interests: true },
  });

  if (!user) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Get upcoming bookings
  const upcomingBookings = await prisma.booking.findMany({
    where: {
      OR: [{ hostId: user.id }, { bookerId: user.id }],
      status: "CONFIRMED",
      slot: { date: { gte: today } },
    },
    include: {
      slot: true,
      host: true,
      booker: true,
    },
    orderBy: { slot: { date: "asc" } },
    take: 5,
  });

  // Get past bookings count (completed meetings)
  const pastBookingsCount = await prisma.booking.count({
    where: {
      OR: [{ hostId: user.id }, { bookerId: user.id }],
      status: "CONFIRMED",
      slot: { date: { lt: today } },
    },
  });

  // Get current roulette match where user hasn't responded yet
  const currentMatch = await prisma.rouletteMatch.findFirst({
    where: {
      OR: [
        { user1Id: user.id, user1Status: "PENDING" },
        { user2Id: user.id, user2Status: "PENDING" },
      ],
    },
    include: {
      user1: { include: { interests: true } },
      user2: { include: { interests: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    user,
    upcomingBookings,
    pastBookingsCount,
    currentMatch,
  };
}

export default async function DashboardPage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/");
  }

  const data = await getDashboardData(userId);

  if (!data) {
    redirect("/");
  }

  const { user, upcomingBookings, pastBookingsCount, currentMatch } = data;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = format(new Date(), "EEEE, MMMM d");

  // Get matched user info
  const matchedUser = currentMatch
    ? currentMatch.user1Id === user.id
      ? currentMatch.user2
      : currentMatch.user1
    : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-medium text-[#1A1A1A]">
            {greeting}, {user.firstName}
          </h1>
          <p className="text-[13px] text-[#6B7280] mt-0.5">{today}</p>
        </div>
        <Link href="/browse">
          <Button className="bg-[#00205B] hover:bg-[#185FA5] text-[13px] h-9">
            <Plus className="h-4 w-4 mr-1.5" />
            Book a lunch
          </Button>
        </Link>
      </div>

      {/* Stats Cards - 3 columns */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-[0.5px] border-[#E5E7EB]">
          <CardContent className="p-4">
            <p className="text-[12px] text-[#6B7280]">Upcoming lunches</p>
            <p className="text-[22px] font-medium text-[#1A1A1A] mt-1">
              {upcomingBookings.length}
            </p>
          </CardContent>
        </Card>

        <Card className="border-[0.5px] border-[#E5E7EB]">
          <CardContent className="p-4">
            <p className="text-[12px] text-[#6B7280]">Past meetings</p>
            <p className="text-[22px] font-medium text-[#1A1A1A] mt-1">
              {pastBookingsCount}
            </p>
          </CardContent>
        </Card>

        <Card className="border-[0.5px] border-[#E5E7EB]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-[12px] text-[#6B7280]">Available today</p>
              <AvailableTodayToggle initialValue={user.isAvailableToday} />
            </div>
            <p className={`text-[13px] mt-2 ${user.isAvailableToday ? 'text-[#085041]' : 'text-[#6B7280]'}`}>
              {user.isAvailableToday ? "You're visible" : "Not visible"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Roulette Card */}
      <Card className="border-[0.5px] border-[rgba(0,32,91,0.12)] bg-[rgba(0,32,91,0.04)]">
        <CardContent className="p-4">
          {currentMatch && matchedUser ? (
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-white">
                <Shuffle className="h-5 w-5 text-[#00205B]" />
              </div>
              <div className="flex-1">
                <p className="text-[12px] text-[#6B7280]">This week's roulette match</p>
                <p className="text-[14px] font-medium text-[#1A1A1A] mt-0.5">
                  {matchedUser.firstName} {matchedUser.lastName}
                </p>
                <p className="text-[11px] text-[#6B7280]">
                  {USER_ROLES[matchedUser.role as keyof typeof USER_ROLES]?.label}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/roulette">
                  <Button
                    size="sm"
                    className="h-8 px-3 text-[12px] bg-[#0F6E56] hover:bg-[#085041]"
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Accept
                  </Button>
                </Link>
                <Link href="/roulette">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-3 text-[12px]"
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Decline
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-white">
                <Shuffle className="h-5 w-5 text-[#00205B]" />
              </div>
              <div className="flex-1">
                <p className="text-[12px] text-[#6B7280]">Lunch Roulette</p>
                <p className="text-[14px] font-medium text-[#1A1A1A] mt-0.5">
                  {user.isRouletteOptedIn ? "No match this week yet" : "You're not opted in"}
                </p>
              </div>
              <Link href="/roulette">
                <Button
                  size="sm"
                  className="h-8 px-4 text-[12px] bg-[#00205B] hover:bg-[#185FA5]"
                >
                  {user.isRouletteOptedIn ? "Spin" : "Enable"}
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Meetings */}
      <div>
        <h2 className="text-[14px] font-medium text-[#1A1A1A] mb-3">Upcoming meetings</h2>
        {upcomingBookings.length === 0 ? (
          <Card className="border-[0.5px] border-[#E5E7EB]">
            <CardContent className="py-8 text-center">
              <Calendar className="h-10 w-10 text-[#D1D5DB] mx-auto mb-3" />
              <p className="text-[13px] text-[#6B7280]">No upcoming meetings</p>
              <Link href="/browse">
                <Button variant="outline" size="sm" className="mt-3 text-[12px]">
                  Browse colleagues
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {upcomingBookings.map((booking, index) => {
              const otherPerson =
                booking.hostId === user.id ? booking.booker : booking.host;
              const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
              return (
                <Card key={booking.id} className="border-[0.5px] border-[#E5E7EB]">
                  <CardContent className="p-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={otherPerson.profilePhotoUrl || undefined} />
                        <AvatarFallback style={{ backgroundColor: avatarColor.bg, color: avatarColor.fg }}>
                          {otherPerson.firstName[0]}{otherPerson.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-[#1A1A1A]">
                          {otherPerson.firstName} {otherPerson.lastName}
                        </p>
                        <p className="text-[12px] text-[#6B7280]">
                          {USER_ROLES[otherPerson.role as keyof typeof USER_ROLES]?.label}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[13px] font-medium text-[#1A1A1A]">
                          {format(booking.slot.date, "EEE, MMM d")}
                        </p>
                        <p className="text-[12px] text-[#6B7280]">
                          {booking.slot.startTime}
                          {booking.boothNumber && (
                            <span className="ml-2 inline-flex items-center gap-1">
                              <Armchair className="h-3 w-3" />
                              Booth {booking.boothNumber}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
