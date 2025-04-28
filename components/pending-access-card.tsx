"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { Eye, X } from "lucide-react";

export function PendingAccessCard() {
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("access_control")
      .select("id, requester_id, status")
      .eq("status", "pending")
      .eq("owner_id", (await supabase.auth.getUser()).data.user?.id);

    if (!error && data) {
      setPendingRequests(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  return (
    <Card className="border-blue-100 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-blue-800 flex justify-between items-center">
          Pending Access Requests
          {pendingRequests.length > 0 && (
            <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {pendingRequests.length} New
            </div>
          )}
        </CardTitle>
        <CardDescription>Healthcare providers requesting access</CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : pendingRequests.length === 0 ? (
          <p className="text-muted-foreground text-sm">No pending access requests.</p>
        ) : (
          pendingRequests.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50 transition"
            >
              <div className="flex flex-col">
                <span className="font-semibold">User ID: {request.requester_id.slice(0, 8)}...</span>
                <span className="text-xs text-gray-500">Requesting record access</span>
              </div>
              <div className="flex gap-2">
                <Eye className="h-5 w-5 text-blue-700" />
                <X className="h-5 w-5 text-red-500" />
              </div>
            </div>
          ))
        )}
        {pendingRequests.length > 0 && (
          <Button
            variant="outline"
            className="w-full mt-2 flex items-center justify-center gap-2 text-blue-700 border-blue-700"
          >
            Manage All Access Requests
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
