"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "./button";

// Define a proper type for access requests
interface AccessRequest {
  id: string;
  requester_id: string;
  requested_at: string;
}

export function PendingAccessControl() {
  const [pendingRequests, setPendingRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUserAndRequests();
  }, []);

  const fetchUserAndRequests = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error("Error fetching user:", userError.message);
      return;
    }

    const uid = userData?.user?.id;
    if (!uid) return;

    setUserId(uid);
    fetchPendingRequests(uid);
  };

  const fetchPendingRequests = async (uid: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("access_control")
        .select("id, requester_id, requested_at")
        .eq("status", "pending")
        .eq("owner_id", uid)
        .order("requested_at", { ascending: true });

      if (error) {
        console.error("Error fetching pending requests:", error.message);
      } else if (data) {
        setPendingRequests(data as AccessRequest[]);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    requestId: string,
    status: "approved" | "rejected",
    requesterId: string
  ) => {
    setSubmitting(true);

    try {
      const { error: updateError } = await supabase
        .from("access_control")
        .update({ status, updated_at: new Date() })
        .eq("id", requestId);

      if (updateError) throw updateError;

      if (status === "approved" && userId) {
        const validTill = new Date();
        validTill.setDate(validTill.getDate() + 30); // 30 days validity

        const { error: insertError } = await supabase
          .from("provider_patient")
          .insert([
            {
              provider_id: requesterId,
              patient_id: userId,
              access_request_id: requestId,
              valid_till: validTill,
            },
          ]);

        if (insertError) throw insertError;
      }

      // ✅ SAFELY Refresh pending requests
      if (userId) {
        fetchPendingRequests(userId);
      }
    } catch (error) {
      console.error("Error processing request:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading pending requests...</p>;
  }

  if (pendingRequests.length === 0) {
    return (
      <p className="text-muted-foreground">
        No pending access requests at the moment.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {pendingRequests.map((request) => (
        <div
          key={request.id}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-3 border rounded-md hover:bg-gray-50 transition"
        >
          <div className="flex flex-col">
            <span className="font-semibold">
              Requester ID: {request.requester_id.slice(0, 8)}...
            </span>
            <span className="text-xs text-gray-500">
              Requested on: {new Date(request.requested_at).toLocaleString()}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={submitting}
              onClick={() =>
                handleUpdateStatus(request.id, "approved", request.requester_id)
              }
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={submitting}
              onClick={() =>
                handleUpdateStatus(request.id, "rejected", request.requester_id)
              }
            >
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
