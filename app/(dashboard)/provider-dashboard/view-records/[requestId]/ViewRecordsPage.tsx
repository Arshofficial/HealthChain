"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../../lib/supabaseClient";
import { Button } from "../../../../../components/ui/button";

export default function ViewRecordsPage() {
  const params = useParams();
  const requestId = params?.requestId as string;

  const [recordType, setRecordType] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!requestId) {
      console.warn("Request ID is not available yet...");
      return;
    }

    const fetchAccessRequestDetails = async () => {
      setLoading(true);

      try {
        // Fetch access control details
        const { data: accessData, error: accessError } = await supabase
          .from("access_control")
          .select("owner_id, requested_record_types")
          .eq("id", requestId)
          .single();

        if (accessError || !accessData) {
          console.error("Failed to fetch access control record:", accessError?.message);
          return;
        }

        const { owner_id, requested_record_types } = accessData;
        const parsedRecordTypes = Array.isArray(requested_record_types) ? requested_record_types : [];
        const firstRecordType = parsedRecordTypes.length > 0 ? parsedRecordTypes[0] : null;

        setPatientId(owner_id);
        setRecordType(firstRecordType);

        if (!firstRecordType) {
          console.error("No record type found for this request.");
          return;
        }

        // Fetch patient records
        const { data: patientRecords, error: recordsError } = await supabase.rpc('fetch_patient_records', {
          p_owner_id: owner_id,
          p_requested_type: firstRecordType
        });

        if (recordsError) {
          console.error("Error fetching patient records:", recordsError?.message);
        } else {
          setRecords(patientRecords || []);
        }

      } catch (error) {
        console.error("Unexpected error fetching records:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccessRequestDetails();
  }, [requestId]);

  async function handleViewOrDownload(filePath: string, action: "view" | "download") {
    if (!filePath) return;

    try {
      const { data, error } = await supabase.storage
        .from("patient-records")
        .createSignedUrl(filePath, 60);

      if (error || !data?.signedUrl) {
        console.error("Failed to generate signed URL:", error?.message);
        return;
      }

      if (action === "view") {
        window.open(data.signedUrl, "_blank");
      } else if (action === "download") {
        const link = document.createElement("a");
        link.href = data.signedUrl;
        link.download = filePath.split("/").pop() || "file";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Unexpected error generating signed URL:", error);
    }
  }

  if (loading) {
    return <div className="p-6 text-center">Loading records...</div>;
  }

  if (!patientId || !recordType) {
    return <div className="p-6 text-center">Invalid request or missing record type.</div>;
  }

  return (
    <div className="p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Patient Records</h1>
      <p><strong>Requested Record Type:</strong> {recordType}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {records.length === 0 ? (
          <div>No records found for this type.</div>
        ) : (
          records.map((record) => (
            <div key={record.id} className="border p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold">
                {record.record_name || "Unnamed Record"}
              </h2>
              <p className="text-sm text-gray-600 mb-2">
                Uploaded: {new Date(record.created_at).toLocaleDateString()}
              </p>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewOrDownload(record.file_url, "view")}
                >
                  View
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleViewOrDownload(record.file_url, "download")}
                >
                  Download
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6">
        <Button onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    </div>
  );
}
