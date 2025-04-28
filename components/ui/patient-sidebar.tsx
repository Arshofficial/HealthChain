"use client";

import Link from "next/link";
import { Home, FileText, Calendar, Settings, Lock } from "lucide-react";

export function PatientSidebar() {
  return (
    <aside className="w-[250px] flex flex-col border-r bg-white min-h-screen">
      <div className="flex flex-col gap-2 p-4">
        <Link
          href="/patient-dashboard"
          className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-blue-50 text-blue-900"
        >
          <Home className="h-4 w-4" />
          <span className="text-sm font-medium">Dashboard</span>
        </Link>

        <Link
          href="/patient-dashboard/records"
          className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-blue-50 text-slate-700"
        >
          <FileText className="h-4 w-4" />
          <span className="text-sm font-medium">Records</span>
        </Link>

        <Link
          href="/patient-dashboard/appointments"
          className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-blue-50 text-slate-700"
        >
          <Calendar className="h-4 w-4" />
          <span className="text-sm font-medium">Appointments</span>
        </Link>

        {/* 🔥 New Access Control Link */}
        <Link
          href="/patient-dashboard/access-control"
          className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-blue-50 text-slate-700"
        >
          <Lock className="h-4 w-4" />
          <span className="text-sm font-medium">Access Control</span>
        </Link>

        <Link
          href="/settings"
          className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-blue-50 text-slate-700"
        >
          <Settings className="h-4 w-4" />
          <span className="text-sm font-medium">Settings</span>
        </Link>
      </div>
    </aside>
  );
}
