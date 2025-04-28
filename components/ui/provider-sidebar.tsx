"use client";

import Link from "next/link";
import { Home, Users, Calendar, Settings } from "lucide-react";

export function ProviderSidebar() {
  return (
    <aside className="w-[250px] flex flex-col border-r bg-white min-h-screen m-0 p-0">
      <div className="flex flex-col gap-2 p-4">
        {/* Dashboard Link - Fixed */}
        <Link href="/provider-dashboard" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-blue-50 text-blue-900">
          <Home className="h-4 w-4" />
          Dashboard
        </Link>

        {/* Other Links - No Change */}
        <Link href="/provider-dashboard/patients" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-blue-50 text-slate-700">
          <Users className="h-4 w-4" />
          Patients
        </Link>
        <Link href="/provider-dashboard/Appointments" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-blue-50 text-slate-700">
          <Calendar className="h-4 w-4" />
          Appointments
        </Link>
        <Link href="/settings" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-blue-50 text-slate-700">
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
