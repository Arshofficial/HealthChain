"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FileText, Bell, User, Settings } from "lucide-react";
import { Avatar, AvatarFallback } from "./avatar"; // Removed AvatarImage
import { Badge } from "./badge";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { SearchProviders } from "./search-providers";
import { supabase } from "../../lib/supabaseClient";

export function Header() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: sessionData } = await supabase.auth.getUser();
      const userId = sessionData?.user?.id;
      if (!userId) return;

      const { data: userData, error } = await supabase
        .from("users")
        .select("role, name")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user:", error.message);
      } else {
        setUser(userData);
      }
    };

    fetchUser();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    return parts
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem("lastLoggedInEmail");
    localStorage.removeItem("userRole");
    window.location.href = "/";
  };

  const basePath =
    user?.role === "Provider" ? "/provider-dashboard" : "/patient-dashboard";

  return (
    <header className="mt-10 sticky top-0 z-10 flex flex-wrap items-center justify-between h-16 gap-4 border-b bg-white px-4 md:px-6">
      {/* Logo */}
      <Link
        href={`/${user?.role.toLowerCase()}-dashboard`}
        className="flex items-center gap-2 font-semibold text-lg text-blue-600"
      >
        <FileText className="h-6 w-6" />
        <span>HealthChain</span>
      </Link>

      {/* Search */}
      {user?.role === "Patient" && (
        <div className="flex-1 max-w-md">
          <SearchProviders />
        </div>
      )}

      {/* Notifications and Profile */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        {/* <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-blue-600">
            3
          </Badge>
          <span className="sr-only">Notifications</span>
        </Button> */}

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar>
                <AvatarFallback className="bg-blue-100 text-blue-800 font-semibold">
                  {user ? getInitials(user.name) : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="../../profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
