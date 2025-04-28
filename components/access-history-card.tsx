"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Eye, ShieldCheck, Clock, XCircle } from "lucide-react";

export function AccessHistoryCard() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccessHistory = async () => {
      setLoading(true);
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData?.user?.id) {
        console.error("User auth failed:", userError?.message);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("access_control")
        .select("id, requester_id, status, requested_at")
        .eq("owner_id", userData.user.id)
        .order("requested_at", { ascending: false });

      if (error) {
        console.error("Access History fetch error:", error.message);
      } else {
        const requestsWithNames = await Promise.all(
          (data || []).map(async (entry) => {
            const { data: userData, error: userError } = await supabase
              .from("users")
              .select("name")
              .eq("id", entry.requester_id)
              .single();

            return {
              ...entry,
              requesterName: userData?.name || "Unknown",
            };
          })
        );

        setHistory(requestsWithNames);
      }
      setLoading(false);
    };

    fetchAccessHistory();
  }, []);

  return (
    <Card className="border-blue-100 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-blue-800">Access History</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading history...</p>
        ) : history.length === 0 ? (
          <p className="text-muted-foreground text-sm">No access history yet.</p>
        ) : (
          history.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3">
              {entry.status === "approved" ? (
                <Eye className="h-5 w-5 text-green-600 mt-1" />
              ) : entry.status === "rejected" ? (
                <ShieldCheck className="h-5 w-5 text-red-600 mt-1" />
              ) : (
                <Clock className="h-5 w-5 text-yellow-600 mt-1" />
              )}
              <div className="flex flex-col">
                <div className="font-medium">
                  Request by: {entry.requesterName}
                </div>
                <div className="text-xs text-gray-500">
                  User ID: {entry.requester_id}
                </div>
                <div className="text-xs text-gray-500">
                  Time: {new Date(entry.updated_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
