"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileSidebar } from "./Sidebar";
import { Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    }

    async function fetchNotifications() {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.slice(0, 5)); // Show latest 5
          setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    }

    fetchUser();
    fetchNotifications();
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  async function markAllRead() {
    try {
      await fetch("/api/notifications/mark-all-read", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  }

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : "??";

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-4 bg-[#00205B] px-4 sm:px-6">
      <MobileSidebar />

      {/* Logo section - mockup style */}
      <div className="flex items-center gap-2">
        <div className="bg-white rounded px-1.5 py-0.5">
          <span className="text-[#00205B] font-medium text-[11px] tracking-wider">IMD</span>
        </div>
        <span className="text-white font-medium text-[15px] hidden sm:block">
          Lunch Connect
        </span>
      </div>

      <div className="flex flex-1 items-center justify-end">
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger className="relative inline-flex items-center justify-center h-9 w-9 rounded-md text-white hover:bg-white/10">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center border-2 border-[#00205B]">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-4 py-2 border-b">
                <span className="font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-[#00205B] h-auto p-0"
                    onClick={markAllRead}
                  >
                    Mark all read
                  </Button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  No notifications yet
                </div>
              ) : (
                <>
                  {notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="flex flex-col items-start gap-1 px-4 py-3 cursor-pointer"
                    >
                      <div className="flex items-start gap-2 w-full">
                        {!notification.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#00205B] mt-1.5 flex-shrink-0" />
                        )}
                        <div className={!notification.isRead ? "" : "ml-4"}>
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <Link href="/notifications" className="block">
                    <DropdownMenuItem className="justify-center text-sm text-[#00205B]">
                      View all notifications
                    </DropdownMenuItem>
                  </Link>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu - mockup style */}
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 w-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors">
              <span className="text-xs font-medium text-white">
                {initials}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2 border-b">
                <p className="text-sm font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <Link href="/profile/setup">
                <DropdownMenuItem>My Profile</DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
