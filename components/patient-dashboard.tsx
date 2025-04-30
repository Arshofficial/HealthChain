"use client";

import { useState, useEffect } from "react";
import { Upload, Eye, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { PendingAccessCard } from "./pending-access-card";
import { AccessHistoryCard } from "./access-history-card";
import { UploadRecordModal } from "./modals/UploadRecordModal";
import { supabase } from "../lib/supabaseClient";
import { PendingAccessControl } from "./ui/pending-access-control";
import { AccessHistoryTimeline } from "./ui/access-history-timeline";
import RecordsPage from "@/app/(dashboard)/patient-dashboard/records/page";

export default function PatientDashboard() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [recentRecords, setRecentRecords] = useState<any[]>([]);
  const [allRecords, setAllRecords] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("overview");

  const router = useRouter();

  const fetchSummary = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const patientEmail = userData?.user?.email;

    if (!patientEmail) return;

    const { data: records, error: recordsError } = await supabase
      .from("patient_records")
      .select(
        "id, record_name, record_type, record_date, file_url, patient_email"
      )
      .eq("patient_email", patientEmail)
      .order("created_at", { ascending: false });

    if (!recordsError && records) {
      setTotalRecords(records.length);
      setLastUpdated(
        records[0]?.record_date
          ? new Date(records[0].record_date).toLocaleDateString()
          : null
      );
      setRecentRecords(records.slice(0, 3));
    }

    const { data: accessRequests, error: accessError } = await supabase
      .from("access_control")
      .select("*")
      .eq("status", "pending");

    if (!accessError && accessRequests) {
      setPendingRequests(accessRequests.length);
    }
  };

  const fetchAllRecords = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const patientEmail = userData?.user?.email;

    if (!patientEmail) return;

    const { data, error } = await supabase
      .from("patient_records")
      .select(
        "id, record_name, record_type, record_date, file_url, patient_email"
      )
      .eq("patient_email", patientEmail)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setAllRecords(data);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handlePreview = async (filePath: string) => {
    if (!filePath) return;

    const { data, error } = await supabase.storage
      .from("patient-records")
      .createSignedUrl(filePath, 60);

    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    } else {
      console.error("Preview error:", error?.message);
    }
  };

  return (
    <div className="flex flex-col gap-6 mt-5">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Welcome!</h1>
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
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-white"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger value="records" className="data-[state=active]:bg-white">
            All Records
          </TabsTrigger>
          <TabsTrigger value="access" className="data-[state=active]:bg-white">
            Access Control
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
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
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    <div className="text-sm">{totalRecords} Total Records</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    <div className="text-sm">
                      Last updated: {lastUpdated || "Today"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    <div className="text-sm">
                      {pendingRequests} Pending Requests
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* My Health Records Card */}
            <Card className="border-blue-100 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-800">
                  My Health Records
                </CardTitle>
                <CardDescription>Your recent medical records</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentRecords.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No recent records available.
                  </p>
                ) : (
                  recentRecords.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-700" />
                        <div className="flex flex-col">
                          <span className="font-semibold">
                            {record.record_name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(record.record_date).toLocaleDateString()}{" "}
                            • {record.record_type}
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
                <Button
                  variant="outline"
                  className="w-full mt-2 flex items-center justify-center gap-2 text-blue-700 border-blue-700"
                  onClick={() => {
                    setActiveTab("records");
                    fetchAllRecords();
                  }}
                >
                  <Eye className="h-4 w-4" />
                  View All Records
                </Button>
              </CardContent>
            </Card>

            {/* Pending Access Card with Props */}
            <PendingAccessCard
              onManageClick={() => setActiveTab("access")}
              onStatusChange={fetchSummary}
            />
          </div>

          {/* Access History */}
          <AccessHistoryCard />
        </TabsContent>

        {/* All Records Tab */}
        <TabsContent value="records" className="space-y-4">
          <RecordsPage />
        </TabsContent>

        {/* Access Control Tab */}
        <TabsContent value="access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Access Requests</CardTitle>
              <CardDescription>
                Manage who can access your health records
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PendingAccessControl />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Access History</CardTitle>
              <CardDescription>
                Timeline of who accessed your records
              </CardDescription>
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
