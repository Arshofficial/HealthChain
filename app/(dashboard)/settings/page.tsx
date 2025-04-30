"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient"; // Correct import
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function SettingsPage() {
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

  const handleSaveChanges = async () => {
    const { name, age, sex, nationality, nationalId } = profile;

    // Validations
    if (!name || !age || !sex || !nationality || !nationalId) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .update({
          name,
          age,
          sex,
          nationality,
          nationalId: nationalId,
        })
        .eq("email", profile.email); // Use the user's email to match the record

      if (error) {
        console.error("Error updating user details:", error); // Log more detailed error
        alert(`Error saving profile changes: ${error.message}`);
        return;
      }

      alert("Changes saved successfully!");
    } catch (err) {
      console.error("Unexpected error:", err); // Catch any other errors
      alert("An unexpected error occurred. Please try again.");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return <div className="p-8">Loading settings...</div>;
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
      <h1 className="text-2xl font-bold">Account Settings</h1>

      <div className="space-y-4">
        <Input
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          placeholder="Name"
        />
        <Input
          value={profile.age}
          onChange={(e) => setProfile({ ...profile, age: e.target.value })}
          placeholder="Age"
          type="number"
        />
        <Input
          value={profile.sex}
          onChange={(e) => setProfile({ ...profile, sex: e.target.value })}
          placeholder="Sex"
        />
        <Input
          value={profile.nationality}
          onChange={(e) =>
            setProfile({ ...profile, nationality: e.target.value })
          }
          placeholder="Nationality"
        />
        <Input
          value={profile.nationalId}
          onChange={(e) =>
            setProfile({ ...profile, nationalId: e.target.value })
          }
          placeholder="National ID"
        />
        <Input value={profile.email} disabled placeholder="Email" />
        <Input value={profile.role} disabled placeholder="Role" />

        <Button
          onClick={handleSaveChanges}
          className="w-full sm:w-auto float-right bg-blue-600 hover:bg-blue-700"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
