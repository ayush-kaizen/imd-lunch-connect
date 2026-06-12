"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface GroupedUsers {
  FACULTY: User[];
  STAFF: User[];
  MBA_STUDENT: User[];
}

const ROLE_LABELS: Record<string, string> = {
  FACULTY: "Faculty",
  STAFF: "Staff",
  MBA_STUDENT: "MBA Students",
};

export default function LoginPage() {
  const router = useRouter();
  const [users, setUsers] = useState<GroupedUsers>({ FACULTY: [], STAFF: [], MBA_STUDENT: [] });
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/users");
        if (res.ok) {
          const data = await res.json();
          const grouped: GroupedUsers = { FACULTY: [], STAFF: [], MBA_STUDENT: [] };
          data.forEach((user: User) => {
            if (grouped[user.role as keyof GroupedUsers]) {
              grouped[user.role as keyof GroupedUsers].push(user);
            }
          });
          setUsers(grouped);

          // Pre-select Ayush Bansal
          const ayush = data.find(
            (u: User) => u.firstName === "Ayush" && u.lastName === "Bansal"
          );
          if (ayush) {
            setSelectedUserId(ayush.id);
          } else if (data.length > 0) {
            setSelectedUserId(data[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  async function handleLogin() {
    if (!selectedUserId) return;

    setLoginLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUserId }),
      });

      if (res.ok) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoginLoading(false);
    }
  }

  const selectedUser = [...users.FACULTY, ...users.STAFF, ...users.MBA_STUDENT].find(
    (u) => u.id === selectedUserId
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F3F0] px-4">
      <Card className="w-full max-w-[380px] border-[0.5px] border-[#E5E7EB]">
        <CardContent className="p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-lg bg-[#00205B] flex items-center justify-center mb-4">
              <span className="text-white font-medium text-[14px]">IMD</span>
            </div>
            <h1 className="text-[20px] font-medium text-[#1A1A1A]">Lunch Connect</h1>
            <p className="text-[13px] text-[#6B7280] mt-1">
              Connect with colleagues over lunch
            </p>
          </div>

          {/* User selector */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[12px] text-[#6B7280]">
                Select your profile
              </label>
              {loading ? (
                <div className="h-10 bg-[#F5F3F0] rounded-lg animate-pulse" />
              ) : (
                <Select value={selectedUserId} onValueChange={(value) => value && setSelectedUserId(value)}>
                  <SelectTrigger className="w-full h-10 text-[13px] border-[#E5E7EB]">
                    <SelectValue placeholder="Choose a user...">
                      {selectedUser
                        ? `${selectedUser.firstName} ${selectedUser.lastName}`
                        : "Choose a user..."}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {(["FACULTY", "STAFF", "MBA_STUDENT"] as const).map((role) => (
                      <SelectGroup key={role}>
                        <SelectLabel className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider">
                          {ROLE_LABELS[role]} ({users[role].length})
                        </SelectLabel>
                        {users[role].map((user) => (
                          <SelectItem key={user.id} value={user.id} className="text-[13px]">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-[#E6F1FB] flex items-center justify-center">
                                <span className="text-[10px] font-medium text-[#00205B]">
                                  {user.firstName[0]}{user.lastName[0]}
                                </span>
                              </div>
                              <span>{user.firstName} {user.lastName}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <Button
              onClick={handleLogin}
              disabled={!selectedUserId || loginLoading}
              className="w-full h-10 bg-[#00205B] hover:bg-[#185FA5] text-[14px] font-medium"
            >
              {loginLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Continue"
              )}
            </Button>
          </div>

          {/* Footer */}
          <p className="text-[12px] text-center text-[#9CA3AF] mt-6">
            Demo version — no password required
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
