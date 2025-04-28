"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateAccountModal } from "@/components/modals/create-account-modal";
import { loginUser, supabase } from "@/lib/supabaseAuth"; // fixed import
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold text-center">Login to HealthChain</h2>

        <div className="space-y-4">
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-700">
            Login
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <span className="text-blue-600 hover:underline cursor-pointer" onClick={() => setShowCreate(true)}>
            Create Account
          </span>
        </p>

        <Button variant="ghost" className="w-full text-muted-foreground" onClick={onClose}>
          Close
        </Button>
      </div>

      {showCreate && <CreateAccountModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
