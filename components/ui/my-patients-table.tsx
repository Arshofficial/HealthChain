"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // ✅ Correct import
import { supabase } from "../../lib/supabaseClient";
import { Button } from "./button";

interface Patient {
  id: string;
  validTill: string;
  patientId: string;
  patientName: string;
}

export function MyPatientsTable() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // ✅ Correct usage

  useEffect(() => {
    async function fetchPatients() {
      try {
        setLoading(true);

        const { data: userData } = await supabase.auth.getUser();
        const providerId = userData?.user?.id;

        if (!providerId) {
          console.error("Provider ID not found.");
          return;
        }

        const { data: patientData, error: patientError } = await supabase
          .from("provider_patient")
          .select("id, valid_till, patient_id")
          .eq("provider_id", providerId);

        if (patientError) {
          console.error("Error fetching patients:", patientError.message);
          return;
        }

        if (!patientData || patientData.length === 0) {
          setPatients([]);
          return;
        }

        const patientIds = patientData.map((p) => p.patient_id);

        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("id, name")
          .in("id", patientIds);

        if (usersError) {
          console.error("Error fetching patient names:", usersError.message);
          return;
        }

        const userMap = Object.fromEntries(
          (usersData || []).map((user) => [user.id, user.name])
        );

        const formattedPatients = (patientData || []).map((patient) => ({
          id: patient.id,
          validTill: new Date(patient.valid_till).toLocaleDateString(),
          patientId: patient.patient_id,
          patientName: userMap[patient.patient_id] || "Unknown",
        }));

        setPatients(formattedPatients);
      } catch (error) {
        console.error("Unexpected error fetching patients:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPatients();
  }, []);

  return (
    <div className="overflow-x-auto rounded-lg border bg-white p-6">
      {loading ? (
        <div className="text-center text-muted-foreground">Loading patients...</div>
      ) : patients.length === 0 ? (
        <div className="text-center text-muted-foreground">No patients found.</div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Access Validity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {patients.map((patient) => (
              <tr key={patient.id}>
                <td className="px-6 py-4 whitespace-nowrap">{patient.patientName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{patient.patientId}</td>
                <td className="px-6 py-4 whitespace-nowrap">{patient.validTill}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => alert('Feature coming soon')}
                  >
                    View Records
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
