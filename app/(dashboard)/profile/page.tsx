"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient"; // Correct import
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "",
    age: "",
    sex: "",
    nationality: "",
    nationalId: "",
    email: "",
    role: "",
  });

  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    const email = localStorage.getItem("lastLoggedInEmail");
    if (!email) {
      alert("No user email found. Please login again.");
      return;
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      console.error(error);
      alert("Error fetching profile.");
      return;
    }

    setProfile(data || {});
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return <div className="p-8">Loading profile...</div>;
  }

  return (
    <div className=" space-y-6">
      <div className="">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>
      <h1 className="text-2xl font-bold">My Profile</h1>

      <div className="space-y-4">
        <Input value={profile.name} disabled placeholder="Name" />
        <Input value={profile.age} disabled placeholder="Age" type="number" />
        <Input value={profile.sex} disabled placeholder="Sex" />
        <Input value={profile.nationality} disabled placeholder="Nationality" />
        <Input value={profile.nationalId} disabled placeholder="National ID" />
        <Input value={profile.email} disabled placeholder="Email" />
        <Input value={profile.role} disabled placeholder="Role" />
      </div>

      {/* <div className="mt-6">
        <Button onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div> */}
    </div>
  );
}
