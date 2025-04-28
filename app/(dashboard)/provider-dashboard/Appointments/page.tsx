"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { supabase } from "../../../../lib/supabaseClient";
import { CalendarDays } from "lucide-react";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("appointments")
      .select("id, provider_email, appointment_date, status, notes")
      .eq("patient_email", (await supabase.auth.getUser()).data.user?.id)
      .order("appointment_date", { ascending: true });

    if (!error && data) {
      setAppointments(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Main Page Heading */}
      <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>

      {/* Upcoming Appointments Card */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
          <CardDescription>Check and manage your upcoming appointments</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-muted-foreground">Loading appointments...</p>
          ) : appointments.length === 0 ? (
            <p className="text-muted-foreground">No appointments scheduled.</p>
          ) : (
            appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-start gap-4 p-3 border rounded-md hover:bg-gray-50 transition"
              >
                <CalendarDays className="h-5 w-5 text-blue-700 mt-1" />
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      With: {appointment.provider_email.slice(0, 8)}...
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(appointment.appointment_date).toLocaleString()}
                  </span>
                  {appointment.notes && (
                    <p className="text-xs text-gray-700">{appointment.notes}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper to color status badges
function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "scheduled":
      return "bg-blue-100 text-blue-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
