"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PatientRecord {
  id: string;
  name: string;
  email: string;
  avatar: string;
  validTill: string;
}

export function MyPatientsTable() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  async function fetchPatients() {
    try {
      setLoading(true);

      // ✅ Correct way: use Supabase client SDK directly
      const { data: userData } = await supabase.auth.getUser();
      const providerId = userData?.user?.id;

      if (!providerId) {
        console.error("Provider ID not found.");
        return;
      }

      const { data: accessData, error: accessError } = await supabase
        .from("provider_patient")
        .select("id, patient_id, valid_till")
        .eq("provider_id", providerId)
        .gte("valid_till", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (accessError || !accessData || accessData.length === 0) {
        console.error("No valid patients found or error:", accessError);
        setPatients([]);
        return;
      }

      const patientIds = accessData.map((entry) => entry.patient_id);

      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, name, email")
        .in("id", patientIds);

      if (usersError || !usersData) {
        console.error("Error fetching users:", usersError?.message);
        return;
      }

      const userMap = Object.fromEntries(usersData.map(user => [user.id, user]));

      const finalPatients = accessData.map((entry) => {
        const patient = userMap[entry.patient_id];
        return {
          id: entry.id,
          name: patient?.name || "Unknown",
          email: patient?.email || "No email",
          avatar: patient?.name ? patient.name[0] : "U",
          validTill: new Date(entry.valid_till).toLocaleDateString(),
        };
      });

      setPatients(finalPatients);
    } catch (err) {
      console.error("Unexpected error fetching patients", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-blue-100 shadow-sm">
      <CardContent className="p-6">
        {loading ? (
          <div className="text-center text-muted-foreground">Loading patients...</div>
        ) : patients.length === 0 ? (
          <div className="text-center text-muted-foreground">No patients found.</div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Patient Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Access Valid Till</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 border border-blue-200">
                        <AvatarImage src={`/placeholder.svg?height=32&width=32`} alt={patient.name} />
                        <AvatarFallback className="bg-blue-100 text-blue-800">
                          {patient.avatar}
                        </AvatarFallback>
                      </Avatar>
                      {patient.name}
                    </div>
                  </TableCell>
                  <TableCell>{patient.email}</TableCell>
                  <TableCell>{patient.validTill}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
