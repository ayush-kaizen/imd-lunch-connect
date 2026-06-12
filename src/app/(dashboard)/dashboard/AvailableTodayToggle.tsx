"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export function AvailableTodayToggle({ initialValue }: { initialValue: boolean }) {
  const [isAvailable, setIsAvailable] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);

  async function handleToggle(checked: boolean) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/users/me/available-today", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailableToday: checked }),
      });

      if (!response.ok) {
        throw new Error("Failed to update");
      }

      setIsAvailable(checked);
      toast.success(
        checked
          ? "You're now visible as available today!"
          : "You're no longer visible as available today"
      );
    } catch (error) {
      toast.error("Failed to update availability");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Switch
        checked={isAvailable}
        onCheckedChange={handleToggle}
        disabled={isLoading}
      />
      <span className={isAvailable ? "text-[#0F6E56] font-medium" : "text-gray-500"}>
        {isAvailable ? "Visible" : "Hidden"}
      </span>
    </div>
  );
}
