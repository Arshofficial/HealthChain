"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Eye, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export function HealthRecordsTable() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("patient_records")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching records:", error.message);
    } else {
      setRecords(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handlePreview = (fileUrl: string) => {
    window.open(fileUrl, "_blank");
  };

  const handleDelete = async (recordId: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;

    const { error } = await supabase
      .from("patient_records")
      .delete()
      .eq("id", recordId);

    if (error) {
      console.error("Error deleting record:", error.message);
    } else {
      alert("Record deleted successfully.");
      fetchRecords();
    }
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  if (records.length === 0)
    return <p className="text-muted-foreground">No records found yet.</p>;

  return (
    <div className="rounded-md border">
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
          {records.map((record) => (
            <tr key={record.id} className="border-t">
              <td className="px-4 py-2">{record.record_name}</td>
              <td className="px-4 py-2">{record.record_type}</td>
              <td className="px-4 py-2">{new Date(record.record_date).toLocaleDateString()}</td>
              <td className="px-4 py-2 flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => handlePreview(record.file_url)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(record.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
