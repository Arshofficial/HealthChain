"use client";

import { useState } from "react";
import { Button } from "../components/ui/button";
import { LoginModal } from "../components/modals/login-modal";

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4">
      {/* Container */}
      <div className="text-center space-y-6 w-full max-w-2xl">
        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-blue-900">
          Welcome to <span className="text-blue-600">HealthChain</span>
        </h1>

        {/* Subtext */}
        <p className="text-md sm:text-lg text-gray-600">
          Securely control and share your health data, powered by blockchain technology.
        </p>

        {/* Login Button */}
        <div>
          <Button
            onClick={() => setShowLogin(true)}
            className="px-6 py-3 sm:px-8 sm:py-4 text-md sm:text-lg bg-blue-600 hover:bg-blue-700 transition rounded-md"
          >
            Login
          </Button>
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </main>
  );
}
