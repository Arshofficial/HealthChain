"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useRouter } from "next/navigation";
import { signUpUser } from "../../lib/supabaseAuth";
import { supabase } from "../../lib/supabaseClient";

export function CreateAccountModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    sex: "",
    nationality: "",
    nationalId: "",
    role: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.password || !formData.name || !formData.role) {
      alert("Please fill all required fields.");
      return;
    }

    // Step 1: Create user in Supabase Auth
    const { data: signupData, error: signupError } = await signUpUser({
      email: formData.email,
      password: formData.password,
    });

    if (signupError || !signupData?.user?.id) {
      alert(`Error signing up: ${signupError?.message || "Unknown error."}`);
      console.error(signupError);
      return;
    }

    // Step 2: Insert user profile in 'users' table
    const { error: userInsertError } = await supabase.from("users").insert([
      {
        id: signupData.user.id, // ✅ Link auth ID with table ID
        email: formData.email,
        role: formData.role,
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : null,
        sex: formData.sex,
        nationality: formData.nationality,
        nationalId: formData.nationalId,
      },
    ]);

    if (userInsertError) {
      alert(`Error saving user profile: ${userInsertError.message}`);
      console.error(userInsertError);
      return;
    }

    alert("Account created successfully! Please login.");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md space-y-6 overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold text-center">Create Account</h2>

        <div className="space-y-4">
          <Input type="text" placeholder="Full Name" name="name" value={formData.name} onChange={handleChange} />
          <Input type="number" placeholder="Age" name="age" value={formData.age} onChange={handleChange} />

          <select name="sex" value={formData.sex} onChange={handleChange} className="w-full rounded-md border border-gray-300 p-2">
            <option value="">Select Sex</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <Input type="text" placeholder="Nationality" name="nationality" value={formData.nationality} onChange={handleChange} />

          <select name="role" value={formData.role} onChange={handleChange} className="w-full rounded-md border border-gray-300 p-2">
            <option value="">Select Role</option>
            <option value="Patient">Patient</option>
            <option value="Provider">Provider</option>
          </select>

          {formData.role === "Patient" && (
            <Input type="text" placeholder="Aadhar Number" name="nationalId" value={formData.nationalId} onChange={handleChange} />
          )}
          {formData.role === "Provider" && (
            <Input type="text" placeholder="Medical License Number" name="nationalId" value={formData.nationalId} onChange={handleChange} />
          )}

          <Input type="email" placeholder="Email" name="email" value={formData.email} onChange={handleChange} />
          <Input type="password" placeholder="Password" name="password" value={formData.password} onChange={handleChange} />

          <Button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700">
            Create Account
          </Button>
        </div>

        <Button variant="ghost" className="w-full text-muted-foreground" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
