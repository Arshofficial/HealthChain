"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

interface AccessRequest {
  id: string;
  requester_id: string;
  requested_at: string;
}

export default function AccessControlPage() {
  const [pendingRequests, setPendingRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchUserAndRequests() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) return;

      setUserId(userData.user.id);
      fetchPendingRequests(userData.user.id);
    }

    fetchUserAndRequests();
  }, []);

  const fetchPendingRequests = async (uid: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("access_control")
      .select("id, requester_id, requested_at")
      .eq("status", "pending")
      .eq("owner_id", uid)
      .order("requested_at", { ascending: true });

    if (!error && data) {
      setPendingRequests(data);
    } else if (error) {
      console.error("Error fetching pending requests:", error.message);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (requestId: string, status: "approved" | "rejected", requesterId: string) => {
    setSubmitting(true);

    try {
      const { error: updateError } = await supabase
        .from("access_control")
        .update({ status, updated_at: new Date() })
        .eq("id", requestId);

      if (updateError) throw updateError;

      if (status === "approved" && userId) {
        const validTill = new Date();
        validTill.setDate(validTill.getDate() + 30); // Add 30 days

        const { error: insertError } = await supabase.from("provider_patient").insert([
          {
            provider_id: requesterId,
            patient_id: userId!, // Force non-null safely
            access_request_id: requestId,
            valid_till: validTill,
          },
        ]);

        if (insertError) throw insertError;
      }

      if (userId) fetchPendingRequests(userId);
    } catch (error) {
      console.error("Error processing request:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-3xl font-bold tracking-tight">Access Control</h2>

      <Card>
        <CardHeader>
          <CardTitle>Pending Access Requests</CardTitle>
          <CardDescription>Manage who can access your health records</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-muted-foreground">Loading requests...</p>
          ) : pendingRequests.length > 0 ? (
            pendingRequests.map((request) => (
              <div
                key={request.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-3 border rounded-md hover:bg-gray-50 transition"
              >
                <div className="flex flex-col">
                  <span className="font-semibold">Requester ID: {request.requester_id.slice(0, 8)}...</span>
                  <span className="text-xs text-gray-500">
                    Requested on: {new Date(request.requested_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={submitting}
                    onClick={() => handleUpdateStatus(request.id, "approved", request.requester_id)}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={submitting}
                    onClick={() => handleUpdateStatus(request.id, "rejected", request.requester_id)}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No pending access requests at the moment.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
