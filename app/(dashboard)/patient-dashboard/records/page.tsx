"use client";

import { useState, useEffect } from "react";
import { Button } from "../../../../components/ui/button";
import { supabase } from "../../../../lib/supabaseClient";
import { UploadRecordModal } from "../../../../components/modals/UploadRecordModal";
import { Input } from "../../../../components/ui/input";
import { Upload, Eye, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";

export default function RecordsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editRecordId, setEditRecordId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ record_name: "", record_type: "" });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const providerId = userData?.user?.id;
      const patientEmail = userData?.user?.email;

      if (!providerId || !patientEmail) {
        console.error("Provider ID or Email not found.");
        return;
      }

      // Querying records from the patient_records table filtered by patient_email
      const { data, error } = await supabase
        .from("patient_records")
        .select("id, record_name, record_type, record_date, file_url, patient_email")
        .eq("patient_email", patientEmail)  // Filtering by patient_email
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching records:", error.message);
      } else {
        setRecords(data || []);
      }
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Handle Preview
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

  const startEditing = (record: any) => {
    setEditRecordId(record.id);
    setEditForm({ record_name: record.record_name, record_type: record.record_type });
  };

  const cancelEditing = () => {
    setEditRecordId(null);
    setEditForm({ record_name: "", record_type: "" });
  };

  const handleEditSave = async () => {
    if (!editRecordId) return;

    const { error } = await supabase
      .from("patient_records")
      .update({
        record_name: editForm.record_name,
        record_type: editForm.record_type,
      })
      .eq("id", editRecordId);

    if (error) {
      console.error("Error updating record:", error.message);
    } else {
      alert("Record updated successfully.");
      cancelEditing();
      fetchRecords();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Health Records</h2>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowUploadModal(true)}
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload New Record
        </Button>
      </div>

      {/* Records Section */}
      {loading ? (
        <Card>
          <CardContent className="p-8">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      ) : records.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>All Health Records</CardTitle>
            <CardDescription>View and manage all your uploaded records</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No records found yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border overflow-x-auto">
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
                  <td className="px-4 py-2">
                    {editRecordId === record.id ? (
                      <Input
                        value={editForm.record_name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, record_name: e.target.value })
                        }
                      />
                    ) : (
                      record.record_name
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editRecordId === record.id ? (
                      <Input
                        value={editForm.record_type}
                        onChange={(e) =>
                          setEditForm({ ...editForm, record_type: e.target.value })
                        }
                      />
                    ) : (
                      record.record_type
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {new Date(record.record_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 flex items-center gap-2">
                    {editRecordId === record.id ? (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={handleEditSave}
                        >
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEditing}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePreview(record.file_url)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditing(record)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(record.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      <UploadRecordModal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        onUploadSuccess={fetchRecords} // <-- Now UploadRecordModal must accept this prop
      />
    </div>
  );
}
