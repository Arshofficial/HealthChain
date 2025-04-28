"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/modals/login-modal";

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-blue-900">
          Welcome to <span className="text-blue-600">HealthChain</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Securely control and share your health data, powered by blockchain technology.
        </p>
        <Button
          onClick={() => setShowLogin(true)}
          className="px-8 py-4 text-lg bg-blue-600 hover:bg-blue-700 transition rounded-md"
        >
          Login
        </Button>
      </div>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </main>
  );
}
