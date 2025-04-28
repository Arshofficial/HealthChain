"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FileText, Search, Bell, User, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Badge } from "./badge";
import { Button } from "./button";
import { Input } from "./input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { SearchProviders } from "./search-providers"; // 👈 Import our new SearchProviders component
import { supabase } from "../../lib/supabaseClient";

export function Header() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
      const fetchUserRole = async () => {
        const { data: user, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", (await supabase.auth.getUser()).data?.user?.id)
          .single();
  
        if (error) {
          console.error("Error fetching user role:", error.message);
        } else {
          setUserRole(user?.role || null);
        }
      };
  
      fetchUserRole();
    }, []);

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    return parts
      .map((p: string) => p[0])
      .join("")
      .slice(0, 2);
  };

  const handleLogout = () => {
    localStorage.removeItem("lastLoggedInEmail");
    localStorage.removeItem("userRole");
    window.location.href = "/";
  };

  const basePath =
    userRole === "Provider" ? "/provider-dashboard" : "/patient-dashboard";
  console.log(userRole);
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6">
      <Link
        href="/"
        className="flex items-center gap-2 font-semibold text-lg text-blue-600"
      >
        <FileText className="h-6 w-6" />
        <span>HealthChain</span>
      </Link>

      {/* Search Section */}
      <div className="flex flex-1 w-[400px] justify-center">
        {userRole === "Patient" ? (
          <div className="w-[400px] fixed">
            <SearchProviders /> {/* 👈 Search Providers bar inserted here */}
          </div>
        ) : (
          <div></div>
        )}
      </div>

      {/* Notifications and Profile */}
      <div className="ml-auto flex items-center gap-4">
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-blue-600">
            3
          </Badge>
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar>
                <AvatarImage
                  src=""
                  alt="User Avatar"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://ui-avatars.com/api/?name=User";
                  }}
                />
                <AvatarFallback className="bg-blue-100 text-blue-800">
                  {user ? getInitials(user.name) : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href={`${basePath}/profile`}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={"/settings"}
                className="flex items-center gap-2"
              >
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
