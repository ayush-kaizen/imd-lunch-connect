"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format, isPast, isFuture } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Calendar, Clock, MapPin, History, CalendarClock, X, Loader2 } from "lucide-react";
import { USER_ROLES } from "@/lib/constants";

interface Booking {
  id: string;
  status: string;
  boothNumber: number | null;
  bookerTalkingPoints: string | null;
  createdAt: string;
  hostId: string;
  bookerId: string;
  slot: {
    date: string;
    startTime: string;
    endTime: string;
    type: string;
  };
  host: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhotoUrl: string | null;
    role: string;
    department: string | null;
  };
  booker: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhotoUrl: string | null;
    role: string;
    department: string | null;
  };
}

interface CurrentUser {
  id: string;
}

export default function PastMeetingsPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

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
    fetchBookings();
  }, []);

  async function fetchBookings() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/bookings/me");
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      toast.error("Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCancel() {
    if (!selectedBooking) return;

    setCancellingId(selectedBooking.id);
    try {
      const response = await fetch(`/api/bookings/${selectedBooking.id}/cancel`, {
        method: "PUT",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to cancel");
      }

      toast.success("Booking cancelled");
      setShowCancelDialog(false);
      setSelectedBooking(null);
      fetchBookings();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel booking");
    } finally {
      setCancellingId(null);
    }
  }

  const upcomingBookings = bookings.filter(
    (b) => b.status === "CONFIRMED" && isFuture(new Date(b.slot.date))
  );

  const pastBookings = bookings.filter(
    (b) => b.status !== "CONFIRMED" || isPast(new Date(b.slot.date))
  );

  function BookingCard({ booking, showCancel = false }: { booking: Booking; showCancel?: boolean }) {
    const isHost = booking.hostId === currentUser?.id;
    const otherPerson = isHost ? booking.booker : booking.host;

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Link href={`/profile/${otherPerson.id}`}>
              <Avatar className="h-14 w-14 cursor-pointer hover:ring-2 hover:ring-[#0F6E56] transition-all">
                <AvatarImage src={otherPerson.profilePhotoUrl || undefined} />
                <AvatarFallback className="bg-[#00205B] text-white">
                  {otherPerson.firstName[0]}
                  {otherPerson.lastName[0]}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link
                    href={`/profile/${otherPerson.id}`}
                    className="font-medium text-gray-900 hover:text-[#0F6E56]"
                  >
                    {otherPerson.firstName} {otherPerson.lastName}
                  </Link>
                  <p className="text-sm text-gray-500">
                    {USER_ROLES[otherPerson.role as keyof typeof USER_ROLES]?.label}
                    {otherPerson.department && ` • ${otherPerson.department}`}
                  </p>
                </div>
                <Badge variant={isHost ? "outline" : "secondary"}>
                  {isHost ? "You're hosting" : "You're invited"}
                </Badge>
              </div>

              <div className="mt-3 space-y-1.5">
                <p className="text-sm flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(booking.slot.date), "EEEE, MMMM d, yyyy")}
                </p>
                <p className="text-sm flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  {booking.slot.startTime} - {booking.slot.endTime}
                </p>
                {booking.boothNumber && (
                  <p className="text-sm flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    Booth #{booking.boothNumber}
                  </p>
                )}
              </div>

              {booking.bookerTalkingPoints && (
                <p className="mt-3 text-sm text-gray-500 italic">
                  "{booking.bookerTalkingPoints}"
                </p>
              )}

              {showCancel && booking.status === "CONFIRMED" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    setSelectedBooking(booking);
                    setShowCancelDialog(true);
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel Meeting
                </Button>
              )}

              {booking.status === "CANCELLED" && (
                <Badge variant="destructive" className="mt-3">
                  Cancelled
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Skeleton className="h-14 w-14 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Meetings</h1>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming" className="gap-2">
            <CalendarClock className="h-4 w-4" />
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="gap-2">
            <History className="h-4 w-4" />
            Past ({pastBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {upcomingBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CalendarClock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-1">
                  No upcoming meetings
                </h3>
                <p className="text-gray-500 mb-4">
                  Browse colleagues to schedule your first lunch
                </p>
                <Link href="/browse">
                  <Button className="bg-[#0F6E56] hover:bg-[#0d5d48]">
                    Browse People
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} showCancel />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {pastBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-1">
                  No past meetings
                </h3>
                <p className="text-gray-500">
                  Your completed and cancelled meetings will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pastBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Meeting</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this meeting? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="py-4">
              <p className="text-sm text-gray-600">
                Meeting with{" "}
                <strong>
                  {selectedBooking.hostId === currentUser?.id
                    ? `${selectedBooking.booker.firstName} ${selectedBooking.booker.lastName}`
                    : `${selectedBooking.host.firstName} ${selectedBooking.host.lastName}`}
                </strong>
              </p>
              <p className="text-sm text-gray-600">
                {format(new Date(selectedBooking.slot.date), "EEEE, MMMM d")} at{" "}
                {selectedBooking.slot.startTime}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelDialog(false);
                setSelectedBooking(null);
              }}
            >
              Keep Meeting
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={!!cancellingId}
            >
              {cancellingId && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Cancel Meeting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
