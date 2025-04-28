"use client";

import { useState } from "react";
import { Search, UserPlus } from "lucide-react";

import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { supabase } from "../lib/supabaseClient";

interface PatientSearchSectionProps {
  onRequestAccess: (patient: any) => void;
}

export function PatientSearchSection({
  onRequestAccess,
}: PatientSearchSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // 👇 Corrected function
  async function handlePatientSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, nationalId, sex, age") // fetching necessary fields
      .or(
        `name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,nationalId.ilike.%${searchQuery}%`
      )
      .eq("role", "Patient");

    if (error) {
      console.error("Error searching patients:", error.message);
      setSearchResults([]);
    } else {
      // Optional: Format data if needed
      const formatted = (data || []).map((p) => ({
        ...p,
        avatar: (p.name || "U")[0], // Fallback if no name
        dob: p.age ? `${new Date().getFullYear() - p.age}` : "N/A", // Approximate DOB
        gender: p.sex || "N/A",
        healthId: p.nationalId || "N/A",
        hasAccess: false, // you can later change based on existing access
      }));
      setSearchResults(formatted);
    }

    setIsSearching(false);
  }

  

  return (
    <Card className="border-blue-100 shadow-sm">
      <CardHeader>
        <CardTitle className="text-blue-800">Search Patient Records</CardTitle>
        <CardDescription>
          Search by patient name, ID, or health identifier to request access
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handlePatientSearch}
          className="flex w-full items-center space-x-2 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, ID, or health identifier..."
              className="pl-8 bg-white focus-visible:ring-blue-500"
              value={searchQuery}
              onChange={(e) => {
                const value = e.target.value;
                setSearchQuery(value);
                if (!value.trim()) {
                  setSearchResults([]); // <-- 🔥 Clear the results if input is empty
                }
              }}
            />
          </div>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSearching || !searchQuery.trim()}
          >
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </form>

        {searchResults.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              {searchResults.length} patient
              {searchResults.length !== 1 ? "s" : ""} found
            </h3>
            <div className="space-y-3">
              {searchResults.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between rounded-lg border border-blue-100 p-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-blue-200">
                      <AvatarImage
                        src={`/placeholder.svg?height=40&width=40`}
                        alt={patient.name}
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-800">
                        {patient.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{patient.name}</div>
                      <div className="text-xs text-muted-foreground">
                        ID: {patient.id} • DOB: {patient.dob} • {patient.gender}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Health ID: {patient.healthId}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {patient.hasAccess ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Access Granted
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => onRequestAccess(patient)}
                      >
                        <UserPlus className="mr-1 h-3 w-3" />
                        Request Access
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : searchQuery && !isSearching ? (
          <div className="text-center py-8 text-muted-foreground">
            Hit Search for "{searchQuery}" ?
          </div>
        ) : (
          !searchQuery &&
          !searchResults.length && (
            <div className="text-center py-8 text-muted-foreground">
              Enter a patient name, ID, or health identifier to search
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
