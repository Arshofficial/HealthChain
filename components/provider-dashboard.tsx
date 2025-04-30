"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { PatientSearchSection } from "./patient-search-section";
import { AccessRequestsTable } from "./access-requests-table";
import { RequestAccessDialog } from "./request-access-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { MyPatientsTable } from "./my-patients-table"; // ✅ Corrected import path
import { supabase } from "../lib/supabaseClient";

export function ProviderDashboard() {
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const handleRequestAccess = (patient: any) => {
    setSelectedPatient(patient);
    setRequestDialogOpen(true);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Welcome!</h1>
      </div>

      <Tabs defaultValue="access" className="space-y-4">
        <TabsList className="bg-blue-50">
          <TabsTrigger value="access" className="data-[state=active]:bg-white">
            Patient Access
          </TabsTrigger>
          <TabsTrigger
            value="patients"
            className="data-[state=active]:bg-white"
          >
            My Patients
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-white"
          >
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* ---- Patient Access Tab ---- */}
        <TabsContent value="access" className="space-y-4">
          <PatientSearchSection onRequestAccess={handleRequestAccess} />
          <AccessRequestsTable />
        </TabsContent>

        {/* ---- My Patients Tab ---- */}
        <TabsContent value="patients" className="space-y-4">
          <Card className="border-blue-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-blue-800">My Patients</CardTitle>
              <CardDescription>
                Patients currently under your care
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MyPatientsTable /> {/* ✅ Now rendering MyPatientsTable */}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Analytics Tab ---- */}
        <TabsContent value="analytics" className="space-y-4">
          <Card className="border-blue-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-blue-800">Analytics</CardTitle>
              <CardDescription>
                Patient data analytics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Analytics dashboard will be displayed here.</p>
              <p className="text-xs">Coming Soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ---- Request Access Modal ---- */}
      <RequestAccessDialog
        open={requestDialogOpen}
        onOpenChange={setRequestDialogOpen}
        patient={selectedPatient}
      />
    </div>
  );
}
