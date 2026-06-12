"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { format, isSameDay, startOfDay, isBefore } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Mail, Calendar as CalendarIcon, Clock, Loader2, CheckCircle, BookOpen, Briefcase, Lightbulb } from "lucide-react";
import { USER_ROLES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePhotoUrl: string | null;
  role: string;
  department: string | null;
  title: string | null;
  bio: string | null;
  pastExperience: string | null;
  currentlyReading: string | null;
  researchWork: string | null;
  funFact: string | null;
  isAvailableToday: boolean;
  interests: { tag: string }[];
  slotsAsHost: Slot[];
}

interface Slot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  durationMinutes: number;
}

interface CurrentUser {
  id: string;
}

export default function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [talkingPoints, setTalkingPoints] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookedBooking, setBookedBooking] = useState<{ boothNumber: number | null } | null>(null);

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data);
        }
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
    }
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  async function fetchProfile() {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        toast.error("User not found");
        router.push("/browse");
      }
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleBookSlot() {
    if (!selectedSlot) return;

    setIsBooking(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          talkingPoints: talkingPoints || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to book");
      }

      const data = await response.json();
      setBookedBooking(data);
      setShowConfirmation(true);
      fetchProfile(); // Refresh to update available slots
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to book slot");
    } finally {
      setIsBooking(false);
    }
  }

  function handleConfirmationClose() {
    setShowConfirmation(false);
    setSelectedSlot(null);
    setSelectedDate(undefined);
    setTalkingPoints("");
    setBookedBooking(null);
  }

  // Get available dates from slots
  const availableDates = profile?.slotsAsHost
    .map((slot) => new Date(slot.date))
    .filter((date) => !isBefore(date, startOfDay(new Date()))) || [];

  // Get slots for selected date
  const slotsForDate = selectedDate
    ? profile?.slotsAsHost.filter((slot) =>
        isSameDay(new Date(slot.date), selectedDate)
      ) || []
    : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <Avatar className="h-24 w-24 mx-auto sm:mx-0">
                <AvatarImage src={profile.profilePhotoUrl || undefined} />
                <AvatarFallback className="bg-[#00205B] text-white text-2xl">
                  {profile.firstName[0]}
                  {profile.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profile.firstName} {profile.lastName}
                  </h1>
                  {profile.isAvailableToday && (
                    <Badge className="bg-green-100 text-green-700 border-green-200 w-fit mx-auto sm:mx-0">
                      <Clock className="h-3 w-3 mr-1" />
                      Available Today
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 mt-1">
                  {profile.title || USER_ROLES[profile.role as keyof typeof USER_ROLES]?.label}
                </p>
                <p className="text-gray-500 text-sm">
                  {USER_ROLES[profile.role as keyof typeof USER_ROLES]?.label}
                  {profile.department && ` • ${profile.department}`}
                </p>

                <div className="flex gap-2 mt-4 justify-center sm:justify-start">
                  <a href={`mailto:${profile.email}`}>
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </Button>
                  </a>
                </div>
              </div>
            </div>

            {profile.bio && (
              <>
                <Separator className="my-6" />
                <div>
                  <h3 className="font-medium mb-2">About</h3>
                  <p className="text-gray-600">{profile.bio}</p>
                </div>
              </>
            )}

            {profile.pastExperience && (
              <>
                <Separator className="my-6" />
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Past Experience
                  </h3>
                  <p className="text-gray-600">{profile.pastExperience}</p>
                </div>
              </>
            )}

            {profile.currentlyReading && (
              <>
                <Separator className="my-6" />
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Currently Reading
                  </h3>
                  <p className="text-gray-600">{profile.currentlyReading}</p>
                </div>
              </>
            )}

            {profile.researchWork && (
              <>
                <Separator className="my-6" />
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Research / Projects
                  </h3>
                  <p className="text-gray-600">{profile.researchWork}</p>
                </div>
              </>
            )}

            {profile.funFact && (
              <>
                <Separator className="my-6" />
                <div>
                  <h3 className="font-medium mb-2">Fun Fact</h3>
                  <p className="text-gray-600 italic">"{profile.funFact}"</p>
                </div>
              </>
            )}

            {profile.interests.length > 0 && (
              <>
                <Separator className="my-6" />
                <div>
                  <h3 className="font-medium mb-3">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest) => (
                      <Badge key={interest.tag} variant="outline">
                        {interest.tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Booking Card */}
        {!isOwnProfile && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-[#0F6E56]" />
                Book a Lunch
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.slotsAsHost.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    {profile.firstName} hasn't set any availability yet
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <Label className="mb-2 block">Select a date</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) =>
                        isBefore(date, startOfDay(new Date())) ||
                        !availableDates.some((d) => isSameDay(d, date))
                      }
                      modifiers={{
                        available: availableDates,
                      }}
                      modifiersClassNames={{
                        available: "bg-green-50 font-semibold",
                      }}
                      className="rounded-lg border"
                    />
                  </div>

                  {selectedDate && (
                    <div className="space-y-3">
                      <Label>Available time slots</Label>
                      {slotsForDate.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                          No slots available on this date
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {slotsForDate.map((slot) => (
                            <button
                              key={slot.id}
                              onClick={() => setSelectedSlot(slot)}
                              className={cn(
                                "w-full p-3 rounded-lg border text-left transition-colors",
                                selectedSlot?.id === slot.id
                                  ? "border-[#0F6E56] bg-green-50"
                                  : "hover:bg-gray-50"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">
                                  {slot.startTime} - {slot.endTime}
                                </span>
                                <Badge variant="outline">
                                  {slot.type === "COFFEE_CHAT" ? "Coffee" : "Lunch"}
                                </Badge>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {selectedSlot && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="talkingPoints">Talking Points (optional)</Label>
                        <Textarea
                          id="talkingPoints"
                          value={talkingPoints}
                          onChange={(e) => setTalkingPoints(e.target.value)}
                          placeholder={`Hi ${profile.firstName}, I'd love to chat about...`}
                          className="mt-1"
                        />
                      </div>
                      <Button
                        onClick={handleBookSlot}
                        disabled={isBooking}
                        className="w-full bg-[#0F6E56] hover:bg-[#0d5d48]"
                      >
                        {isBooking && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Book {selectedSlot.type === "COFFEE_CHAT" ? "Coffee Chat" : "Lunch"}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {isOwnProfile && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500 mb-4">This is your profile</p>
              <Button onClick={() => router.push("/profile/setup")}>
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={handleConfirmationClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              Booking Confirmed!
            </DialogTitle>
            <DialogDescription>
              Your lunch meeting has been scheduled
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <p>
                <strong>With:</strong> {profile?.firstName} {profile?.lastName}
              </p>
              {selectedSlot && (
                <>
                  <p>
                    <strong>Date:</strong>{" "}
                    {format(new Date(selectedSlot.date), "EEEE, MMMM d, yyyy")}
                  </p>
                  <p>
                    <strong>Time:</strong> {selectedSlot.startTime} -{" "}
                    {selectedSlot.endTime}
                  </p>
                </>
              )}
              {bookedBooking?.boothNumber && (
                <p>
                  <strong>Booth:</strong> #{bookedBooking.boothNumber}
                </p>
              )}
            </div>
            <p className="text-sm text-gray-500">
              A notification has been sent to both of you.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleConfirmationClose}
              >
                Close
              </Button>
              <Button
                className="flex-1 bg-[#0F6E56] hover:bg-[#0d5d48]"
                onClick={() => router.push("/dashboard")}
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
