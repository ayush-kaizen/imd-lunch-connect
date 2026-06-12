"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Sparkles, Check, X, History, Calendar, Loader2 } from "lucide-react";
import { RouletteWheel } from "@/components/roulette/RouletteWheel";
import { USER_ROLES } from "@/lib/constants";

interface MatchedUser {
  id: string;
  firstName: string;
  lastName: string;
  profilePhotoUrl: string | null;
  role: string;
  department: string | null;
  interests?: { tag: string }[];
}

interface Match {
  id: string;
  weekOf: string;
  status: string;
  myStatus: string;
  otherStatus: string;
  createdAt: string;
  matchedUser: MatchedUser;
}

interface SpinResult {
  matchId: string;
  matchedUser: MatchedUser;
  suggestedSlot: {
    date: string;
    startTime: string;
    endTime: string;
  } | null;
  interestOverlap: number;
}

export default function RoulettePage() {
  const router = useRouter();
  const [isOptedIn, setIsOptedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [spinResult, setSpinResult] = useState<SpinResult | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [isResponding, setIsResponding] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      // Fetch user's roulette opt-in status
      const meResponse = await fetch("/api/users/me");
      if (meResponse.ok) {
        const meData = await meResponse.json();
        // API returns user directly or in data property
        const userData = meData.data || meData;
        setIsOptedIn(userData?.isRouletteOptedIn || false);
      }

      // Fetch matches
      const matchesResponse = await fetch("/api/roulette/me");
      if (matchesResponse.ok) {
        const matchesData = await matchesResponse.json();
        // API returns array directly
        setMatches(Array.isArray(matchesData) ? matchesData : matchesData.data || []);
      }
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleOptInToggle(checked: boolean) {
    try {
      const response = await fetch("/api/users/me/roulette-optin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rouletteOptIn: checked }),
      });

      if (!response.ok) {
        throw new Error("Failed to update");
      }

      setIsOptedIn(checked);
      toast.success(
        checked
          ? "You're now opted in to Lunch Roulette!"
          : "You've opted out of Lunch Roulette"
      );
    } catch (error) {
      toast.error("Failed to update preference");
    }
  }

  async function handleSpin() {
    setIsSpinning(true);

    // Start spinning animation
    setTimeout(async () => {
      try {
        const response = await fetch("/api/roulette/spin", {
          method: "POST",
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to spin");
        }

        const data = await response.json();
        // API returns data directly or in data property
        setSpinResult(data.data || data);
        setShowResultDialog(true);
        fetchData(); // Refresh matches
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to spin");
      } finally {
        setIsSpinning(false);
      }
    }, 4000); // Wait for animation
  }

  async function handleRespond(matchId: string, response: "ACCEPTED" | "DECLINED") {
    setIsResponding(true);
    try {
      const res = await fetch(`/api/roulette/${matchId}/respond`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response }),
      });

      if (!res.ok) {
        throw new Error("Failed to respond");
      }

      toast.success(response === "ACCEPTED" ? "Match accepted!" : "Match declined");
      setShowResultDialog(false);
      setSpinResult(null);
      fetchData();
    } catch (error) {
      toast.error("Failed to respond to match");
    } finally {
      setIsResponding(false);
    }
  }

  // Find match where the current user hasn't responded yet (myStatus === "PENDING")
  const currentMatch = matches.find((m) => m.myStatus === "PENDING");
  const pastMatches = matches.filter((m) => m.myStatus !== "PENDING");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-[#0F6E56]" />
          Lunch Roulette
        </h1>
        <p className="text-gray-500 mt-1">
          Spin the wheel to get matched with a random colleague
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Wheel Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Spin the Wheel</CardTitle>
              <div className="flex items-center gap-2">
                <Label htmlFor="opt-in" className="text-sm">
                  Opt In
                </Label>
                <Switch
                  id="opt-in"
                  checked={isOptedIn}
                  onCheckedChange={handleOptInToggle}
                />
              </div>
            </div>
            <CardDescription>
              {isOptedIn
                ? "You're eligible to match and be matched with others"
                : "Opt in to participate in Lunch Roulette"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            {!isOptedIn ? (
              <div className="text-center py-8">
                <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  Enable Lunch Roulette to get random lunch matches
                </p>
                <Button
                  onClick={() => handleOptInToggle(true)}
                  className="bg-[#0F6E56] hover:bg-[#0d5d48]"
                >
                  Enable Roulette
                </Button>
              </div>
            ) : currentMatch ? (
              <div className="text-center space-y-4">
                <p className="text-sm text-amber-600 font-medium">
                  You have a pending match this week!
                </p>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={currentMatch.matchedUser.profilePhotoUrl || undefined} />
                    <AvatarFallback className="bg-[#00205B] text-white text-xl">
                      {currentMatch.matchedUser.firstName[0]}
                      {currentMatch.matchedUser.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="font-medium">
                      {currentMatch.matchedUser.firstName}{" "}
                      {currentMatch.matchedUser.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {USER_ROLES[currentMatch.matchedUser.role as keyof typeof USER_ROLES]?.label}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleRespond(currentMatch.id, "ACCEPTED")}
                    disabled={isResponding}
                    className="flex-1 bg-[#0F6E56] hover:bg-[#0d5d48]"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleRespond(currentMatch.id, "DECLINED")}
                    disabled={isResponding}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                </div>
                <Button
                  variant="link"
                  onClick={() => router.push(`/profile/${currentMatch.matchedUser.id}`)}
                >
                  View Profile
                </Button>
              </div>
            ) : (
              <>
                <RouletteWheel
                  isSpinning={isSpinning}
                  onSpinComplete={() => {}}
                />
                <Button
                  onClick={handleSpin}
                  disabled={isSpinning}
                  size="lg"
                  className="bg-[#0F6E56] hover:bg-[#0d5d48] px-8"
                >
                  {isSpinning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Spinning...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Spin the Wheel
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Past Matches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Past Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pastMatches.length === 0 ? (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No past matches yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pastMatches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center gap-4 p-3 rounded-lg border"
                  >
                    <Avatar>
                      <AvatarImage src={match.matchedUser.profilePhotoUrl || undefined} />
                      <AvatarFallback className="bg-[#00205B] text-white">
                        {match.matchedUser.firstName[0]}
                        {match.matchedUser.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {match.matchedUser.firstName} {match.matchedUser.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Week of {format(new Date(match.weekOf), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Badge
                      variant={match.status === "CONFIRMED" ? "default" : "secondary"}
                      className={match.status === "CONFIRMED" ? "bg-green-100 text-green-700" : match.status === "DECLINED" ? "bg-amber-100 text-amber-700" : ""}
                    >
                      {match.status === "CONFIRMED"
                        ? "Completed"
                        : match.status === "DECLINED"
                        ? "Declined"
                        : "Expired"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#0F6E56]" />
              You've Got a Match!
            </DialogTitle>
            <DialogDescription>
              The wheel has spoken. Here's your lunch match for this week!
            </DialogDescription>
          </DialogHeader>

          {spinResult && (
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={spinResult.matchedUser.profilePhotoUrl || undefined} />
                  <AvatarFallback className="bg-[#00205B] text-white text-2xl">
                    {spinResult.matchedUser.firstName[0]}
                    {spinResult.matchedUser.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {spinResult.matchedUser.firstName} {spinResult.matchedUser.lastName}
                  </h3>
                  <p className="text-gray-500">
                    {USER_ROLES[spinResult.matchedUser.role as keyof typeof USER_ROLES]?.label}
                    {spinResult.matchedUser.department &&
                      ` • ${spinResult.matchedUser.department}`}
                  </p>
                  {spinResult.interestOverlap > 0 && (
                    <Badge variant="outline" className="mt-2">
                      {spinResult.interestOverlap} shared{" "}
                      {spinResult.interestOverlap === 1 ? "interest" : "interests"}
                    </Badge>
                  )}
                </div>
              </div>

              {spinResult.suggestedSlot && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Suggested Time
                  </p>
                  <p className="mt-1 text-green-800">
                    {format(new Date(spinResult.suggestedSlot.date), "EEEE, MMMM d")} at{" "}
                    {spinResult.suggestedSlot.startTime}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => handleRespond(spinResult.matchId, "ACCEPTED")}
                  disabled={isResponding}
                  className="flex-1 bg-[#0F6E56] hover:bg-[#0d5d48]"
                >
                  {isResponding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Accept Match
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleRespond(spinResult.matchId, "DECLINED")}
                  disabled={isResponding}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-1" />
                  Decline
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
