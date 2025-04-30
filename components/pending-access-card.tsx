"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { supabase } from "../lib/supabaseClient";
import { Check, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast"; // 🧩 Toast from shadcn/ui

interface PendingAccessCardProps {
  onManageClick: () => void;
  onStatusChange: () => void;
}

export function PendingAccessCard({
  onManageClick,
  onStatusChange,
}: PendingAccessCardProps) {
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingRequests = async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const ownerId = userData?.user?.id;

    const { data, error } = await supabase
      .from("access_control")
      .select("id, requester_id, requested_at")
      .eq("status", "pending")
      .eq("owner_id", ownerId);

    if (!error && data) {
      setPendingRequests(data || []);
    }

    setLoading(false);
  };

  const handleStatusChange = async (
    id: string,
    newStatus: "approved" | "rejected"
  ) => {
    const { error } = await supabase
      .from("access_control")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      toast({
        title: `Request ${newStatus === "approved" ? "Approved" : "Rejected"}`,
        description: `Requester ID: ${id.slice(0, 8)}...`,
      });
      fetchPendingRequests();
      onStatusChange();
    } else {
      toast({
        variant: "destructive",
        title: "Failed to update request",
        description: error.message,
      });
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  return (
    <Card className="border-blue-100 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-blue-800 flex justify-between items-center text-base md:text-lg">
          Pending Access Requests
          {pendingRequests.length > 0 && (
            <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {pendingRequests.length} New
            </div>
          )}
        </CardTitle>
        <CardDescription className="text-sm">
          Healthcare providers requesting access
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : pendingRequests.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No pending access requests.
          </p>
        ) : (
          pendingRequests.map((request) => (
            <div
              key={request.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-2 border rounded-md gap-3 hover:bg-gray-50 transition"
            >
              <div className="flex flex-col">
                <span className="font-semibold text-sm sm:text-base">
                  Requester ID: {request.requester_id.slice(0, 8)}...
                </span>
                <span className="text-xs text-gray-500">
                  Requested on:{" "}
                  {request.requested_at
                    ? new Date(request.requested_at).toLocaleString()
                    : "—"}
                </span>
              </div>
              <div className="flex gap-3">
                <Check
                  className="h-5 w-5 text-green-600 cursor-pointer"
                  onClick={() => handleStatusChange(request.id, "approved")}
                />
                <X
                  className="h-5 w-5 text-red-500 cursor-pointer"
                  onClick={() => handleStatusChange(request.id, "rejected")}
                />
              </div>
            </div>
          ))
        )}

        {pendingRequests.length > 0 && (
          <Button
            variant="outline"
            className="w-full mt-2 flex items-center justify-center gap-2 text-blue-700 border-blue-700"
            onClick={onManageClick}
          >
            Manage All Access Requests
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
