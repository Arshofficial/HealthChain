"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, Users, Calendar, Settings, FileText, Lock, Menu, X } from "lucide-react";

interface SidebarProps {
  type: "provider" | "patient";
}

export function Sidebar({ type }: SidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = type === "provider"
    ? [
        { href: "/provider-dashboard", icon: Home, label: "Dashboard" },
        { href: "/provider-dashboard/patients", icon: Users, label: "Patients" },
        { href: "/provider-dashboard/appointments", icon: Calendar, label: "Appointments" },
        { href: "/settings", icon: Settings, label: "Settings" },
      ]
    : [
        { href: "/patient-dashboard", icon: Home, label: "Dashboard" },
        { href: "/patient-dashboard/records", icon: FileText, label: "Records" },
        { href: "/patient-dashboard/appointments", icon: Calendar, label: "Appointments" },
        { href: "/patient-dashboard/access-control", icon: Lock, label: "Access Control" },
        { href: "/settings", icon: Settings, label: "Settings" },
      ];

  return (
    <>
      {/* Mobile Topbar with Hamburger */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white shadow">
        <button onClick={() => setSidebarOpen(true)} className="text-blue-900">
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-bold text-blue-900">HealthChain</h1>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed z-40 inset-y-0 left-0 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex md:flex-col w-[250px] border-r bg-white min-h-screen`}
      >
        {/* Mobile Close Button */}
        <div className="flex md:hidden justify-end p-4">
          <button onClick={() => setSidebarOpen(false)} className="text-blue-900">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Sidebar Links */}
        <div className="flex flex-col gap-2 p-4">
          {links.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-blue-50 text-slate-700"
              onClick={() => setSidebarOpen(false)} // Auto-close on mobile after click
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </aside>

      {/* Dark overlay when sidebar is open on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
