"use client";

import { useState, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, startOfDay, getDay, addDays, startOfWeek, endOfWeek } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Plus, Trash2, Coffee, Utensils, Loader2, Home } from "lucide-react";
import { TIME_SLOTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface Slot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "LUNCH" | "COFFEE_CHAT";
  durationMinutes: number;
  isBooked: boolean;
  booking?: {
    booker: {
      firstName: string;
      lastName: string;
    };
  } | null;
}

export default function AvailabilityPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newSlot, setNewSlot] = useState({
    timeSlot: "",
    slotType: "LUNCH" as "LUNCH" | "COFFEE_CHAT",
  });

  useEffect(() => {
    fetchSlots();
  }, [currentMonth]);

  async function fetchSlots() {
    setIsLoading(true);
    try {
      const month = format(currentMonth, "yyyy-MM");
      const response = await fetch(`/api/slots/me?month=${month}&includeBooked=true`);
      if (response.ok) {
        const data = await response.json();
        setSlots(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      toast.error("Failed to load availability");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateSlot() {
    if (!selectedDate || !newSlot.timeSlot) {
      toast.error("Please select a time slot");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedTime = TIME_SLOTS.find((t) => t.label === newSlot.timeSlot);
      if (!selectedTime) return;

      const response = await fetch("/api/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: format(selectedDate, "yyyy-MM-dd"),
          startTime: selectedTime.start,
          endTime: selectedTime.end,
          type: newSlot.slotType,
          durationMinutes: selectedTime.duration,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create slot");
      }

      toast.success("Availability added!");
      setIsDialogOpen(false);
      setNewSlot({ timeSlot: "", slotType: "LUNCH" });
      fetchSlots();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create slot");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteSlot(slotId: string) {
    try {
      const response = await fetch(`/api/slots/${slotId}`, { method: "DELETE" });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete slot");
      }
      toast.success("Slot deleted");
      fetchSlots();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete slot");
    }
  }

  // Get weeks with Mon-Fri only
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Filter to only Mon-Fri (getDay: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
  const weekdays = allDays.filter(day => {
    const d = getDay(day);
    return d >= 1 && d <= 5; // Mon-Fri only
  });

  // Group into weeks
  const weeks: Date[][] = [];
  for (let i = 0; i < weekdays.length; i += 5) {
    weeks.push(weekdays.slice(i, i + 5));
  }

  function getSlotsForDate(date: Date) {
    return slots.filter((slot) => isSameDay(new Date(slot.date), date));
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-medium text-[#1A1A1A]">My availability</h1>
          <p className="text-[13px] text-[#6B7280] mt-0.5">
            Manage your lunch and coffee chat availability
          </p>
        </div>
        <Button
          className="bg-[#00205B] hover:bg-[#185FA5] text-[13px] h-9"
          onClick={() => {
            if (!selectedDate) {
              // Select first available future weekday
              const today = new Date();
              const futureDay = weekdays.find(d => !isBefore(d, startOfDay(today)));
              if (futureDay) setSelectedDate(futureDay);
            }
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add slot
        </Button>
      </div>

      {/* Month navigation + Legend */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-[14px] font-medium text-[#1A1A1A] min-w-[120px] text-center">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-[#6B7280]">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#00205B]" />
            Lunch
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#85B7EB]" />
            Coffee chat
          </div>
        </div>
      </div>

      {/* Calendar grid - Mon-Fri only */}
      <Card className="border-[0.5px] border-[#E5E7EB]">
        <CardContent className="p-3">
          {/* Day headers */}
          <div className="grid grid-cols-5 gap-2 mb-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
              <div key={day} className="text-center text-[11px] text-[#9CA3AF] py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar weeks */}
          {isLoading ? (
            <div className="grid grid-cols-5 gap-2">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="grid grid-cols-5 gap-2">
                  {week.map((day) => {
                    const daySlots = getSlotsForDate(day);
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isPast = isBefore(day, startOfDay(new Date()));
                    const isSelected = selectedDate && isSameDay(day, selectedDate);

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => !isPast && setSelectedDate(day)}
                        disabled={isPast}
                        className={cn(
                          "min-h-[80px] p-2 text-left rounded-lg border-[0.5px] transition-colors",
                          !isCurrentMonth && "opacity-40",
                          isPast && "bg-[#F5F3F0] cursor-not-allowed",
                          !isPast && "bg-white hover:border-[#CBD5E1] cursor-pointer",
                          isSelected && "border-[#00205B] border-2",
                          !isSelected && "border-[#E5E7EB]",
                          isToday(day) && !isSelected && "border-[#00205B]"
                        )}
                      >
                        <span
                          className={cn(
                            "text-[12px] font-medium",
                            isToday(day) && "bg-[#00205B] text-white px-1.5 py-0.5 rounded"
                          )}
                        >
                          {format(day, "d")}
                        </span>
                        {daySlots.length > 0 && (
                          <div className="mt-1.5 space-y-1">
                            {daySlots.slice(0, 2).map((slot) => (
                              <div
                                key={slot.id}
                                className={cn(
                                  "text-[10px] px-1.5 py-0.5 rounded font-medium",
                                  slot.type === "COFFEE_CHAT"
                                    ? "bg-[#85B7EB] text-[#042C53]"
                                    : "bg-[#00205B] text-white"
                                )}
                              >
                                {slot.startTime.slice(0, 5)}
                              </div>
                            ))}
                            {daySlots.length > 2 && (
                              <span className="text-[10px] text-[#9CA3AF]">
                                +{daySlots.length - 2} more
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected date slots */}
      {selectedDate && (
        <Card className="border-[0.5px] border-[#E5E7EB]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-medium text-[#1A1A1A]">
                {format(selectedDate, "EEEE, MMMM d")}
              </h3>
              {!isBefore(selectedDate, startOfDay(new Date())) && (
                <Button
                  size="sm"
                  className="h-7 text-[11px] bg-[#00205B] hover:bg-[#185FA5]"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add slot
                </Button>
              )}
            </div>

            {getSlotsForDate(selectedDate).length === 0 ? (
              <p className="text-[12px] text-[#6B7280] py-4 text-center">
                No availability set for this day
              </p>
            ) : (
              <div className="space-y-2">
                {getSlotsForDate(selectedDate).map((slot) => (
                  <div
                    key={slot.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border-[0.5px]",
                      slot.isBooked ? "bg-[#E1F5EE] border-[#5DCAA5]" : "bg-white border-[#E5E7EB]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-lg",
                          slot.type === "COFFEE_CHAT" ? "bg-[#FAEEDA]" : "bg-[#E6F1FB]"
                        )}
                      >
                        {slot.type === "COFFEE_CHAT" ? (
                          <Coffee className="h-4 w-4 text-[#633806]" />
                        ) : (
                          <Utensils className="h-4 w-4 text-[#00205B]" />
                        )}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-[#1A1A1A]">
                          {slot.startTime} – {slot.endTime}
                        </p>
                        <p className="text-[11px] text-[#6B7280]">
                          {slot.type === "COFFEE_CHAT" ? "Coffee chat" : "Lunch"} • {slot.durationMinutes} min
                        </p>
                        {slot.isBooked && slot.booking && (
                          <p className="text-[11px] text-[#085041] mt-0.5">
                            Booked with {slot.booking.booker.firstName} {slot.booking.booker.lastName}
                          </p>
                        )}
                      </div>
                    </div>
                    {!slot.isBooked && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#9CA3AF] hover:text-red-500 hover:bg-red-50"
                        onClick={() => handleDeleteSlot(slot.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add slot dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[16px]">Add availability</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-[12px] text-[#6B7280]">Date</Label>
              <div className="p-2.5 bg-[#F5F3F0] rounded-lg text-[13px] font-medium">
                {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Select a date"}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px] text-[#6B7280]">Time slot</Label>
              <Select
                value={newSlot.timeSlot}
                onValueChange={(value) => setNewSlot((prev) => ({ ...prev, timeSlot: value ?? "" }))}
              >
                <SelectTrigger className="text-[13px]">
                  <SelectValue placeholder="Select a time" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((slot) => (
                    <SelectItem key={slot.label} value={slot.label} className="text-[13px]">
                      {slot.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px] text-[#6B7280]">Type</Label>
              <div className="flex p-1 bg-[#F5F3F0] rounded-lg">
                <button
                  type="button"
                  onClick={() => setNewSlot((prev) => ({ ...prev, slotType: "LUNCH" }))}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-[13px] font-medium transition-all",
                    newSlot.slotType === "LUNCH"
                      ? "bg-white text-[#1A1A1A] shadow-sm"
                      : "text-[#6B7280] hover:text-[#1A1A1A]"
                  )}
                >
                  <Utensils className="h-4 w-4" />
                  Lunch
                </button>
                <button
                  type="button"
                  onClick={() => setNewSlot((prev) => ({ ...prev, slotType: "COFFEE_CHAT" }))}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-[13px] font-medium transition-all",
                    newSlot.slotType === "COFFEE_CHAT"
                      ? "bg-white text-[#1A1A1A] shadow-sm"
                      : "text-[#6B7280] hover:text-[#1A1A1A]"
                  )}
                >
                  <Coffee className="h-4 w-4" />
                  Coffee
                </button>
              </div>
            </div>

            <Button
              onClick={handleCreateSlot}
              disabled={isSubmitting || !newSlot.timeSlot || !selectedDate}
              className="w-full bg-[#00205B] hover:bg-[#185FA5] h-10 text-[13px]"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add availability
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
