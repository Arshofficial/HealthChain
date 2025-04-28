"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Eye, ShieldCheck, Clock, XCircle } from "lucide-react";

export function AccessHistoryTimeline() {
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
        .select("id, requester_id, status, updated_at")
        .eq("owner_id", userData.user.id)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Access History fetch error:", error.message);
      } else {
        setHistory(data || []);
      }
      setLoading(false);
    };

    fetchAccessHistory();
  }, []);

  if (loading) return <p className="text-muted-foreground">Loading access history...</p>;

  if (history.length === 0)
    return <p className="text-muted-foreground">No access history yet.</p>;

  return (
    <div className="flex flex-col gap-4">
      {history.map((entry) => (
        <div key={entry.id} className="flex items-center gap-3">
          {entry.status === "approved" ? (
            <Eye className="h-5 w-5 text-green-600" />
          ) : entry.status === "rejected" ? (
            <ShieldCheck className="h-5 w-5 text-red-600" />
          ) : entry.status === "cancelled_by_provider" ? (
            <XCircle className="h-5 w-5 text-orange-600" />
          ) : (
            <Clock className="h-5 w-5 text-yellow-600" />
          )}
          <div className="flex flex-col">
            <div className="font-medium capitalize">
              {entry.status.replace("_", " ")} by user {entry.requester_id.slice(0, 8)}...
            </div>
            <div className="text-xs text-gray-500">
              Updated on: {new Date(entry.updated_at).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
