"use client";

export function Footer() {
  return (
    <footer className="w-full mt-auto bg-white border-t">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4 py-6 text-center text-sm text-gray-500">
        
        {/* Left side */}
        <div className="mb-4 md:mb-0">
          HealthChain | Empowering Health Data Ownership
        </div>

        {/* Middle (Contact Email) */}
        <div className="mb-4 md:mb-0">
          Contact: <a href="mailto:m24de2038@iitj.ac.in" className="text-blue-600 hover:underline">M24DE2038@iitj.ac.in</a>
        </div>

        {/* Right side */}
        <div>
          © {new Date().getFullYear()} HealthChain. All rights reserved.
        </div>

      </div>
    </footer>
  );
}
