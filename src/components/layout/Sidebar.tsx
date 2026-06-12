"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Sparkles,
  Clock,
  History,
  User,
  Menu,
  ArrowLeftRight,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";
import { Separator } from "@/components/ui/separator";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Meetings", href: "/past-meetings", icon: History },
  { name: "My Availability", href: "/availability", icon: Calendar },
  { name: "Browse People", href: "/browse", icon: Users },
  { name: "Available Today", href: "/available-today", icon: Clock },
  { name: "Lunch Roulette", href: "/roulette", icon: Sparkles },
];

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface GroupedUsers {
  FACULTY: UserData[];
  STAFF: UserData[];
  MBA_STUDENT: UserData[];
}

const ROLE_LABELS: Record<string, string> = {
  FACULTY: "Faculty",
  STAFF: "Staff",
  MBA_STUDENT: "MBA Students",
};

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-0.5 px-4 py-4">
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-[13px] transition-colors",
              isActive
                ? "bg-[rgba(0,32,91,0.06)] text-[#00205B] font-medium border-l-[3px] border-[#00205B] -ml-px"
                : "text-[#6B7280] hover:bg-[#F8F9FA] hover:text-[#1A1A1A]"
            )}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" style={{ verticalAlign: '-2px' }} />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

function SwitchUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [users, setUsers] = useState<GroupedUsers>({
    FACULTY: [],
    STAFF: [],
    MBA_STUDENT: [],
  });
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    if (open) {
      async function fetchUsers() {
        try {
          const res = await fetch("/api/users");
          if (res.ok) {
            const data = await res.json();
            const grouped: GroupedUsers = { FACULTY: [], STAFF: [], MBA_STUDENT: [] };
            data.forEach((user: UserData) => {
              if (grouped[user.role as keyof GroupedUsers]) {
                grouped[user.role as keyof GroupedUsers].push(user);
              }
            });
            setUsers(grouped);
          }
        } catch (error) {
          console.error("Failed to fetch users:", error);
        } finally {
          setLoading(false);
        }
      }
      fetchUsers();
    }
  }, [open]);

  async function handleSwitch() {
    if (!selectedUserId) return;
    setSwitching(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUserId }),
      });

      if (res.ok) {
        onOpenChange(false);
        router.refresh();
        window.location.reload();
      }
    } catch (error) {
      console.error("Switch user error:", error);
    } finally {
      setSwitching(false);
    }
  }

  const selectedUser = [...users.FACULTY, ...users.STAFF, ...users.MBA_STUDENT].find(
    (u) => u.id === selectedUserId
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Switch User</DialogTitle>
          <DialogDescription>
            Select a different user profile for the demo.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {loading ? (
            <div className="h-10 bg-gray-100 rounded-md animate-pulse" />
          ) : (
            <Select value={selectedUserId} onValueChange={(value) => value && setSelectedUserId(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a user...">
                  {selectedUser
                    ? `${selectedUser.firstName} ${selectedUser.lastName}`
                    : "Choose a user..."}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(["FACULTY", "STAFF", "MBA_STUDENT"] as const).map((role) => (
                  <SelectGroup key={role}>
                    <SelectLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {ROLE_LABELS[role]} ({users[role].length})
                    </SelectLabel>
                    {users[role].map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#E6F1FB] flex items-center justify-center">
                            <span className="text-xs font-medium text-[#00205B]">
                              {user.firstName[0]}
                              {user.lastName[0]}
                            </span>
                          </div>
                          <span>
                            {user.firstName} {user.lastName}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            onClick={handleSwitch}
            disabled={!selectedUserId || switching}
            className="w-full bg-[#00205B] hover:bg-[#185FA5]"
          >
            {switching ? "Switching..." : "Switch User"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function Sidebar() {
  const [switchUserOpen, setSwitchUserOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden md:flex md:w-[200px] md:flex-col md:fixed md:top-14 md:bottom-0 bg-white border-r border-[#E5E7EB]">
        <div className="flex flex-col flex-1">
          <NavLinks />
          <div className="mx-4 border-t border-[#E5E7EB]" />
          <div className="px-4 py-3 space-y-0.5">
            <Link
              href="/profile/setup"
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-[13px] transition-colors",
                pathname === "/profile/setup"
                  ? "bg-[rgba(0,32,91,0.06)] text-[#00205B] font-medium border-l-[3px] border-[#00205B] -ml-px"
                  : "text-[#6B7280] hover:bg-[#F8F9FA] hover:text-[#1A1A1A]"
              )}
            >
              <User className="h-4 w-4" />
              My Profile
            </Link>
            <button
              onClick={() => setSwitchUserOpen(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[#6B7280] hover:bg-[#F8F9FA] hover:text-[#1A1A1A] transition-colors"
            >
              <ArrowLeftRight className="h-4 w-4" />
              Switch User
            </button>
          </div>
        </div>
      </aside>
      <SwitchUserDialog open={switchUserOpen} onOpenChange={setSwitchUserOpen} />
    </>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const [switchUserOpen, setSwitchUserOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden text-white hover:bg-white/10"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">Open menu</span>
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full bg-white">
            <div className="flex items-center h-14 px-4 border-b border-[#E5E7EB] bg-[#00205B]">
              <Link
                href="/dashboard"
                className="flex items-center gap-2"
                onClick={() => setOpen(false)}
              >
                <div className="bg-white rounded px-1.5 py-0.5">
                  <span className="text-[#00205B] font-medium text-[11px] tracking-wider">IMD</span>
                </div>
                <span className="text-white font-medium text-[15px]">Lunch Connect</span>
              </Link>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
            <div className="px-3 py-4 border-t border-[#E5E7EB] space-y-1">
              <Link
                href="/profile/setup"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  pathname === "/profile/setup"
                    ? "bg-[#00205B] text-white"
                    : "text-[#6B7280] hover:bg-[#F8F9FA] hover:text-[#1A1A1A]"
                )}
              >
                <User className="h-5 w-5" />
                My Profile
              </Link>
              <Separator className="my-2" />
              <button
                onClick={() => {
                  setOpen(false);
                  setSwitchUserOpen(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F8F9FA] hover:text-[#1A1A1A] transition-colors"
              >
                <ArrowLeftRight className="h-5 w-5" />
                Switch User
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <SwitchUserDialog open={switchUserOpen} onOpenChange={setSwitchUserOpen} />
    </>
  );
}
