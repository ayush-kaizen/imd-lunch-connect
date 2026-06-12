"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Zap, Info, Clock } from "lucide-react";
import { USER_ROLES } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Avatar colors from mockup
const AVATAR_COLORS = [
  { bg: '#E6F1FB', fg: '#0C447C' },
  { bg: '#EEEDFE', fg: '#3C3489' },
  { bg: '#E1F5EE', fg: '#085041' },
  { bg: '#FAEEDA', fg: '#633806' },
  { bg: '#FBEAF0', fg: '#72243E' },
  { bg: '#FAECE7', fg: '#712B13' },
];

function getAvatarColor(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  profilePhotoUrl: string | null;
  role: string;
  department: string | null;
  bio: string | null;
  interests: { tag: string }[];
  slotsAsHost: { id: string; startTime: string; endTime: string; type: string }[];
}

export default function AvailableTodayPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const meResponse = await fetch("/api/users/me");
      if (meResponse.ok) {
        const meData = await meResponse.json();
        const userData = meData.data || meData;
        setIsAvailable(userData?.isAvailableToday || false);
      }

      const usersResponse = await fetch("/api/users?availableToday=true");
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(Array.isArray(usersData) ? usersData : usersData.data || []);
      }
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggle(checked: boolean) {
    setIsToggling(true);
    try {
      const response = await fetch("/api/users/me/available-today", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailableToday: checked }),
      });

      if (!response.ok) throw new Error("Failed to update");

      setIsAvailable(checked);
      toast.success(
        checked
          ? "You're now visible as available today!"
          : "You're no longer visible as available today"
      );
      fetchData();
    } catch (error) {
      toast.error("Failed to update availability");
    } finally {
      setIsToggling(false);
    }
  }

  const roleCounts = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredUsers = selectedRole
    ? users.filter((user) => user.role === selectedRole)
    : users;

  return (
    <div className="space-y-4">
      {/* Header with toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-[#00205B]" />
          <h1 className="text-[18px] font-medium text-[#1A1A1A]">Available today</h1>
        </div>
        <Switch
          checked={isAvailable}
          onCheckedChange={handleToggle}
          disabled={isToggling}
        />
      </div>

      {/* Subtitle */}
      <p className="text-[13px] text-[#6B7280]">
        Toggle on to let colleagues know you're free for lunch today.{" "}
        <span className="text-[#9CA3AF]">Auto-resets at 13:45.</span>
      </p>

      {/* Green info banner */}
      <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[#E1F5EE] border-[0.5px] border-[#5DCAA5]">
        <Info className="h-4 w-4 text-[#085041] mt-0.5 shrink-0" />
        <p className="text-[12px] text-[#085041]">
          When you toggle "Available today", you'll appear in this list and colleagues can reach out to book a spontaneous lunch with you.
        </p>
      </div>

      {/* Role filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedRole(null)}
          className={cn(
            "text-[12px] px-3 py-1 rounded-full transition-colors",
            !selectedRole
              ? "bg-[#00205B] text-white"
              : "bg-transparent border border-[#E5E7EB] text-[#6B7280] hover:border-[#00205B]"
          )}
        >
          All ({users.length})
        </button>
        {Object.entries(USER_ROLES).map(([key, { label }]) => {
          const count = roleCounts[key] || 0;
          if (count === 0) return null;
          return (
            <button
              key={key}
              onClick={() => setSelectedRole(selectedRole === key ? null : key)}
              className={cn(
                "text-[12px] px-3 py-1 rounded-full transition-colors",
                selectedRole === key
                  ? "bg-[#00205B] text-white"
                  : "bg-transparent border border-[#E5E7EB] text-[#6B7280] hover:border-[#00205B]"
              )}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Users list */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-[0.5px] border-[#E5E7EB]">
              <CardContent className="p-3.5">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-[42px] w-[42px] rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card className="border-[0.5px] border-[#E5E7EB]">
          <CardContent className="py-10 text-center">
            <Clock className="h-10 w-10 text-[#D1D5DB] mx-auto mb-3" />
            <p className="text-[13px] font-medium text-[#1A1A1A]">
              {selectedRole ? "No one in this role is available" : "No one is available today yet"}
            </p>
            <p className="text-[12px] text-[#6B7280] mt-1">
              {!isAvailable && "Be the first! Toggle your availability above."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredUsers.map((user, index) => {
            const avatarColor = getAvatarColor(index);
            const firstSlot = user.slotsAsHost[0];
            return (
              <Card key={user.id} className="border-[0.5px] border-[#E5E7EB] hover:border-[#CBD5E1] transition-colors">
                <CardContent className="p-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-[42px] w-[42px] shrink-0">
                      <AvatarImage src={user.profilePhotoUrl || undefined} />
                      <AvatarFallback style={{ backgroundColor: avatarColor.bg, color: avatarColor.fg }}>
                        {user.firstName[0]}{user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[14px] font-medium text-[#1A1A1A]">
                          {user.firstName} {user.lastName}
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-[rgba(0,32,91,0.08)] text-[#6B7280]">
                          {USER_ROLES[user.role as keyof typeof USER_ROLES]?.label}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#6B7280] mt-0.5 truncate">
                        {user.interests.slice(0, 3).map(i => i.tag).join(" • ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {firstSlot && (
                        <span className="text-[12px] font-medium text-[#0F6E56]">
                          Free {firstSlot.startTime}–{firstSlot.endTime}
                        </span>
                      )}
                      <Link href={`/profile/${user.id}`}>
                        <Button
                          size="sm"
                          className="h-7 px-3 text-[11px] bg-[#00205B] hover:bg-[#185FA5]"
                        >
                          Book
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
