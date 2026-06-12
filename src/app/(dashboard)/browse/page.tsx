"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Clock } from "lucide-react";
import { USER_ROLES, INTEREST_TAGS } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Avatar colors from mockup - cycle through these
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
  isAvailableToday: boolean;
  interests: { tag: string }[];
  slotsAsHost: { id: string }[];
}

export default function BrowsePeoplePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [availableTodayOnly, setAvailableTodayOnly] = useState(false);
  const [showMoreTags, setShowMoreTags] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          user.firstName.toLowerCase().includes(searchLower) ||
          user.lastName.toLowerCase().includes(searchLower) ||
          user.department?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      if (selectedRole && user.role !== selectedRole) return false;
      if (selectedInterests.length > 0) {
        const userInterests = user.interests.map((i) => i.tag);
        if (!selectedInterests.some((i) => userInterests.includes(i))) return false;
      }
      if (availableTodayOnly && !user.isAvailableToday) return false;
      return true;
    });
  }, [users, search, selectedRole, selectedInterests, availableTodayOnly]);

  function toggleInterest(interest: string) {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  }

  // Count users by role
  const roleCounts = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const visibleTags = showMoreTags ? INTEREST_TAGS : INTEREST_TAGS.slice(0, 8);
  const remainingTagCount = INTEREST_TAGS.length - 8;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-[18px] font-medium text-[#1A1A1A]">Browse people</h1>
        <p className="text-[13px] text-[#6B7280] mt-0.5">
          Find and connect with colleagues for lunch
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
        <Input
          placeholder="Search by name or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-[13px] bg-white border-[#E5E7EB]"
        />
      </div>

      {/* Role filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => { setSelectedRole(null); setAvailableTodayOnly(false); }}
          className={cn(
            "text-[12px] px-3 py-1 rounded-full transition-colors",
            !selectedRole && !availableTodayOnly
              ? "bg-[#00205B] text-white"
              : "bg-transparent border border-[#E5E7EB] text-[#6B7280] hover:border-[#00205B]"
          )}
        >
          All ({users.length})
        </button>
        {Object.entries(USER_ROLES).map(([key, { label }]) => (
          <button
            key={key}
            onClick={() => { setSelectedRole(selectedRole === key ? null : key); setAvailableTodayOnly(false); }}
            className={cn(
              "text-[12px] px-3 py-1 rounded-full transition-colors",
              selectedRole === key
                ? "bg-[#00205B] text-white"
                : "bg-transparent border border-[#E5E7EB] text-[#6B7280] hover:border-[#00205B]"
            )}
          >
            {label} ({roleCounts[key] || 0})
          </button>
        ))}
        <button
          onClick={() => { setAvailableTodayOnly(!availableTodayOnly); setSelectedRole(null); }}
          className={cn(
            "text-[12px] px-3 py-1 rounded-full transition-colors flex items-center gap-1",
            availableTodayOnly
              ? "bg-[#E1F5EE] text-[#085041] border border-[#5DCAA5]"
              : "bg-transparent border border-[#E5E7EB] text-[#6B7280] hover:border-[#5DCAA5]"
          )}
        >
          <Clock className="h-3 w-3" />
          Available today
        </button>
      </div>

      {/* Interest tag filters */}
      <div className="flex flex-wrap items-center gap-1.5">
        {visibleTags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleInterest(tag)}
            className={cn(
              "text-[11px] px-2 py-0.5 rounded-full transition-colors",
              selectedInterests.includes(tag)
                ? "bg-[#00205B] text-white"
                : "bg-[rgba(0,32,91,0.06)] text-[#6B7280] hover:bg-[rgba(0,32,91,0.1)]"
            )}
          >
            {tag}
          </button>
        ))}
        {!showMoreTags && remainingTagCount > 0 && (
          <button
            onClick={() => setShowMoreTags(true)}
            className="text-[11px] px-2 py-0.5 text-[#00205B] hover:underline"
          >
            +{remainingTagCount} more
          </button>
        )}
        {showMoreTags && (
          <button
            onClick={() => setShowMoreTags(false)}
            className="text-[11px] px-2 py-0.5 text-[#00205B] hover:underline"
          >
            Show less
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-[12px] text-[#9CA3AF]">
        {filteredUsers.length} {filteredUsers.length === 1 ? "person" : "people"} found
      </p>

      {/* People grid - 2 columns */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border-[0.5px] border-[#E5E7EB]">
              <CardContent className="p-3.5">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-[38px] w-[38px] rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card className="border-[0.5px] border-[#E5E7EB]">
          <CardContent className="py-10 text-center">
            <Search className="h-10 w-10 text-[#D1D5DB] mx-auto mb-3" />
            <p className="text-[13px] font-medium text-[#1A1A1A]">No people found</p>
            <p className="text-[12px] text-[#6B7280] mt-1">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filteredUsers.map((user, index) => {
            const avatarColor = getAvatarColor(index);
            return (
              <Link key={user.id} href={`/profile/${user.id}`}>
                <Card className="border-[0.5px] border-[#E5E7EB] hover:border-[#CBD5E1] transition-colors cursor-pointer">
                  <CardContent className="p-3.5">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-[38px] w-[38px] shrink-0">
                        <AvatarImage src={user.profilePhotoUrl || undefined} />
                        <AvatarFallback style={{ backgroundColor: avatarColor.bg, color: avatarColor.fg }}>
                          {user.firstName[0]}{user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-[13px] font-medium text-[#1A1A1A] truncate">
                            {user.firstName} {user.lastName}
                          </h3>
                          {user.isAvailableToday && (
                            <span className="h-2 w-2 rounded-full bg-[#5DCAA5] shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-[#6B7280] truncate">
                          {USER_ROLES[user.role as keyof typeof USER_ROLES]?.label}
                        </p>
                        {user.interests.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {user.interests.slice(0, 3).map((interest) => (
                              <span
                                key={interest.tag}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(0,32,91,0.06)] text-[#6B7280]"
                              >
                                {interest.tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
