"use client";

import { useEffect, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/header";
import { PatientSidebar } from "@/components/ui/patient-sidebar";
import { ProviderSidebar } from "@/components/ui/provider-sidebar";
import { supabase } from "@/lib/supabaseClient";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: user, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", (await supabase.auth.getUser()).data?.user?.id)
        .single();

      if (error) {
        console.error("Error fetching user role:", error.message);
      } else {
        setUserRole(user?.role || null);
      }
    };

    fetchUserRole();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-60 border-r bg-white flex flex-col">
          <SidebarProvider>
            {userRole !== null && (userRole === "Provider" ? <ProviderSidebar /> : <PatientSidebar />)}
          </SidebarProvider>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-gray-50 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
