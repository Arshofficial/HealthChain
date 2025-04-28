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

    // Step 1: Sign Up
    const { data: signupData, error: signupError } = await signUpUser({
      email: formData.email,
      password: formData.password,
    });

    if (signupError || !signupData?.user?.id) {
      alert(`Error signing up: ${signupError?.message || "Unknown error."}`);
      console.error(signupError);
      return;
    }

    // Step 2: Insert User Record
    const { error: userInsertError } = await supabase.from("users").insert([
      {
        id: signupData.user.id,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[90vh]">
        
        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-blue-900">
          Create <span className="text-blue-600">Account</span>
        </h2>

        {/* Form */}
        <div className="space-y-4">
          <Input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
          />

          <Input
            type="number"
            name="age"
            placeholder="Age"
            value={formData.age}
            onChange={handleChange}
          />

          <select
            name="sex"
            value={formData.sex}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select Sex</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <Input
            type="text"
            name="nationality"
            placeholder="Nationality"
            value={formData.nationality}
            onChange={handleChange}
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select Role</option>
            <option value="Patient">Patient</option>
            <option value="Provider">Provider</option>
          </select>

          {formData.role === "Patient" && (
            <Input
              type="text"
              name="nationalId"
              placeholder="Aadhar Number"
              value={formData.nationalId}
              onChange={handleChange}
            />
          )}

          {formData.role === "Provider" && (
            <Input
              type="text"
              name="nationalId"
              placeholder="Medical License Number"
              value={formData.nationalId}
              onChange={handleChange}
            />
          )}

          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />

          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />

          <Button
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-md sm:text-lg transition rounded-md"
          >
            Create Account
          </Button>
        </div>

        {/* Cancel Button */}
        <Button
          variant="ghost"
          className="w-full text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          Cancel
        </Button>

      </div>
    </div>
  );
}
