"use client";

import { useState, useEffect } from "react";
import { Upload, Eye, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { HealthRecordsCard } from "./health-records-card";
import { PendingAccessCard } from "./pending-access-card";
import { AccessHistoryCard } from "./access-history-card";
import { UploadRecordModal } from "./modals/UploadRecordModal";
import { supabase } from "../lib/supabaseClient";
import { PendingAccessControl } from "./ui/pending-access-control";
import { AccessHistoryTimeline } from "./ui/access-history-timeline";

export default function PatientDashboard() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [recentRecords, setRecentRecords] = useState<any[]>([]);
  const [allRecords, setAllRecords] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("overview");

  const router = useRouter();

  // Function to fetch the summary data for the dashboard
  const fetchSummary = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const patientEmail = userData?.user?.email;

    if (!patientEmail) {
      console.error("Patient Email not found.");
      return;
    }

    // Fetch records filtered by patient_email
    const { data: records, error: recordsError } = await supabase
      .from("patient_records")
      .select("id, record_name, record_type, record_date, file_url, patient_email")
      .eq("patient_email", patientEmail)  // Filter by patient_email
      .order("created_at", { ascending: false });

    if (!recordsError && records) {
      setTotalRecords(records.length);
      setLastUpdated(records[0]?.record_date ? new Date(records[0].record_date).toLocaleDateString() : null);
      setRecentRecords(records.slice(0, 3));  // Display only the 3 most recent records
    }

    // Fetch pending access requests
    const { data: accessRequests, error: accessError } = await supabase
      .from("access_control")
      .select("*")
      .eq("status", "pending");

    if (!accessError && accessRequests) {
      setPendingRequests(accessRequests.length);
    }
  };

  // Function to fetch all records for the "All Records" tab
  async function fetchAllRecords() {
    const { data: userData } = await supabase.auth.getUser();
    const patientEmail = userData?.user?.email;

    if (!patientEmail) {
      console.error("Patient Email not found.");
      return;
    }

    const { data, error } = await supabase
      .from("patient_records")
      .select("id, record_name, record_type, record_date, file_url, patient_email")
      .eq("patient_email", patientEmail)  // Filter by patient_email
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching records:", error.message);
    } else {
      setAllRecords(data || []);
    }
  }

  useEffect(() => {
    fetchSummary();  // Fetch summary when component mounts
  }, []);

  // Handle Preview of record
  async function handlePreview(filePath: string) {
    if (!filePath) return;

    const { data, error } = await supabase.storage
      .from("patient-records")
      .createSignedUrl(filePath, 60);

    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    } else {
      console.error("Preview error:", error?.message);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Patient Dashboard</h1>
        <Button
          className="ml-auto bg-blue-600 hover:bg-blue-700"
          onClick={() => setUploadDialogOpen(true)}
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload New Record
        </Button>
      </div>

      {/* Tabs Section */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          if (value === "records") {
            fetchAllRecords();
          }
        }}
        className="space-y-4"
      >
        <TabsList className="bg-blue-50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="records" className="data-[state=active]:bg-white">
            All Records
          </TabsTrigger>
          <TabsTrigger value="access" className="data-[state=active]:bg-white">
            Access Control
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab Content */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Summary Card */}
            <Card className="border-blue-100 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-800">Summary</CardTitle>
                <CardDescription>Your health data overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                    <div className="text-sm">{totalRecords} Total Records</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                    <div className="text-sm">
                      Last updated: {lastUpdated ? lastUpdated : "Today"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                    <div className="text-sm">{pendingRequests} Pending Requests</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* My Health Records */}
            <Card className="border-blue-100 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-800">My Health Records</CardTitle>
                <CardDescription>Your recent medical records</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentRecords.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No recent records available.</p>
                ) : (
                  recentRecords.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-700" />
                        <div className="flex flex-col">
                          <span className="font-semibold">{record.record_name}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(record.record_date).toLocaleDateString()} • {record.record_type}
                          </span>
                        </div>
                      </div>
                      <Eye
                        className="h-5 w-5 cursor-pointer text-blue-700"
                        onClick={() => handlePreview(record.file_url)}
                      />
                    </div>
                  ))
                )}

                {/* View All Records Button */}
                <Button
                  variant="outline"
                  className="w-full mt-2 flex items-center justify-center gap-2 text-blue-700 border-blue-700"
                  onClick={() => { setActiveTab("records"); fetchAllRecords() }}
                >
                  <Eye className="h-4 w-4" />
                  View All Records
                </Button>
              </CardContent>
            </Card>

            {/* Pending Access */}
            <PendingAccessCard />
          </div>

          {/* Access History */}
          <AccessHistoryCard />
        </TabsContent>

        {/* All Records Tab Content */}
        <TabsContent value="records" className="space-y-4">
          <div className="rounded-md border overflow-x-auto">
            {allRecords.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No records found.</div>
            ) : (
              <table className="w-full table-auto">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Record Name</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Record Type</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Record Date</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allRecords.map((record) => (
                    <tr key={record.id} className="border-t">
                      <td className="px-4 py-2">{record.record_name}</td>
                      <td className="px-4 py-2">{record.record_type}</td>
                      <td className="px-4 py-2">{new Date(record.record_date).toLocaleDateString()}</td>
                      <td className="px-4 py-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePreview(record.file_url)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>

        {/* Access Control Tab Content */}
        <TabsContent value="access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Access Requests</CardTitle>
              <CardDescription>Manage who can access your health records</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PendingAccessControl />
            </CardContent>
          </Card>

          {/* Access History */}
          <Card>
            <CardHeader>
              <CardTitle>Access History</CardTitle>
              <CardDescription>Timeline of who accessed your records</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AccessHistoryTimeline />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Modal */}
      <UploadRecordModal
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadSuccess={fetchSummary}
      />
    </div>
  );
}
