"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { INTEREST_TAGS, USER_ROLES } from "@/lib/constants";
import { X, Loader2 } from "lucide-react";

interface UserProfile {
  firstName: string;
  lastName: string;
  bio: string;
  role: string;
  department: string;
  title: string;
  pastExperience: string;
  currentlyReading: string;
  researchWork: string;
  funFact: string;
  interests: { tag: string }[];
}

export default function ProfileSetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    role: "MBA_STUDENT",
    department: "",
    title: "",
    pastExperience: "",
    currentlyReading: "",
    researchWork: "",
    funFact: "",
    interests: [] as string[],
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data: UserProfile = await response.json();
          setFormData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            bio: data.bio || "",
            role: data.role || "MBA_STUDENT",
            department: data.department || "",
            title: data.title || "",
            pastExperience: data.pastExperience || "",
            currentlyReading: data.currentlyReading || "",
            researchWork: data.researchWork || "",
            funFact: data.funFact || "",
            interests: data.interests?.map((i) => i.tag) || [],
          });
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    }

    loadProfile();
  }, []);

  function toggleInterest(tag: string) {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(tag)
        ? prev.interests.filter((t) => t !== tag)
        : prev.interests.length < 10
        ? [...prev.interests, tag]
        : prev.interests,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      toast.success("Profile saved successfully!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Failed to save profile");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSkip() {
    router.push("/dashboard");
  }

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0F6E56]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Your Profile</CardTitle>
          <CardDescription>
            Help colleagues get to know you better. This information will be visible to
            other IMD community members.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, role: value ?? "MBA_STUDENT" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(USER_ROLES).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g., Professor of Finance"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, department: e.target.value }))
                }
                placeholder="e.g., Finance, Strategy"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bio: e.target.value }))
                }
                placeholder="Tell us about yourself, your background, and what you're interested in discussing over lunch..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pastExperience">Past Experience</Label>
              <Textarea
                id="pastExperience"
                value={formData.pastExperience}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, pastExperience: e.target.value }))
                }
                placeholder="Previous roles, companies, or relevant experience..."
                className="min-h-[80px]"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="currentlyReading">Currently Reading</Label>
                <Input
                  id="currentlyReading"
                  value={formData.currentlyReading}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, currentlyReading: e.target.value }))
                  }
                  placeholder="Book, article, or paper..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="funFact">Fun Fact</Label>
                <Input
                  id="funFact"
                  value={formData.funFact}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, funFact: e.target.value }))
                  }
                  placeholder="Something interesting about you..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="researchWork">Research / Projects</Label>
              <Textarea
                id="researchWork"
                value={formData.researchWork}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, researchWork: e.target.value }))
                }
                placeholder="Current research interests or projects..."
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Interests (select up to 10)</Label>
                <span className="text-sm text-gray-500">
                  {formData.interests.length}/10 selected
                </span>
              </div>

              {formData.interests.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                  {formData.interests.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-[#0F6E56] text-white hover:bg-[#0d5d48] cursor-pointer"
                      onClick={() => toggleInterest(tag)}
                    >
                      {tag}
                      <X className="ml-1 h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-3 border rounded-lg">
                {INTEREST_TAGS.filter((tag) => !formData.interests.includes(tag)).map(
                  (tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => toggleInterest(tag)}
                    >
                      {tag}
                    </Badge>
                  )
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-[#0F6E56] hover:bg-[#0d5d48]"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Profile
              </Button>
              <Button type="button" variant="outline" onClick={handleSkip}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
