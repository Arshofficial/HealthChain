"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { CreateAccountModal } from "./create-account-modal";
import { loginUser, supabase } from "../../lib/supabaseAuth";
import { useRouter } from "next/navigation";

export function LoginModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill in both fields.");
      return;
    }

    const { data, error } = await loginUser({ email, password });

    if (error) {
      alert(`Login failed: ${error.message}`);
      console.error(error);
      return;
    }

    localStorage.setItem("lastLoggedInEmail", email);

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("email", email)
      .single();

    if (userError || !userData) {
      alert("Unable to fetch user role. Please try again.");
      console.error(userError);
      return;
    }

    if (userData.role === "Patient") {
      router.push("/patient-dashboard");
    } else if (userData.role === "Provider") {
      router.push("/provider-dashboard");
    } else {
      alert("Invalid user role. Please contact support.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 sm:p-8 space-y-6">
        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-blue-900">
          Login to <span className="text-blue-600">HealthChain</span>
        </h2>

        {/* Form */}
        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-md sm:text-lg transition rounded-md"
          >
            Login
          </Button>
        </div>

        {/* Create account link */}
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <span
            className="text-blue-600 hover:underline cursor-pointer font-medium"
            onClick={() => setShowCreate(true)}
          >
            Create Account
          </span>
        </p>

        {/* Close button */}
        <Button
          variant="ghost"
          className="w-full text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          Close
        </Button>
      </div>

      {/* Create Account Modal */}
      {showCreate && <CreateAccountModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
