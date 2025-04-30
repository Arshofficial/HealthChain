"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { Clock, FileText, ShieldAlert, ShieldCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

// Define AccessRequest type properly
interface AccessRequest {
  id: string;
  patientId: string;
  patientName: string;
  requesterName: string;
  status: string;
  requestDate: string;
  recordType: string;
  reason: string;
  requestedDuration: number;
  avatar: string;
  file_id: string | null;
}

export function AccessRequestsTable() {
  const router = useRouter();

  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAccessRequests();
  }, []);

  const fetchAccessRequests = async () => {
    try {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      const providerId = userData?.user?.id;

      if (!providerId) {
        console.error("Provider ID not found.");
        return;
      }

      const { data, error } = await supabase
        .from("access_control")
        .select(
          `
          id,
          requester_id,
          owner_id,
          status,
          requested_record_types,
          requested_duration,
          reason,
          requested_at,
          file_id,
          owner:users!access_control_owner_id_fkey(id, name),
          requester:users!access_control_requester_id_fkey(id, name)
        `
        )
        .eq("requester_id", providerId)
        .order("requested_at", { ascending: false });

      if (error) {
        console.error("Error fetching access requests:", error.message);
      } else {
        const formatted = (data || []).map((req: any) => ({
          id: req.id,
          patientId: Array.isArray(req.owner)
            ? req.owner[0]?.id
            : req.owner?.id || "Unknown",
          patientName: Array.isArray(req.owner)
            ? req.owner[0]?.name || "Unknown"
            : req.owner?.name || "Unknown",
          requesterName: Array.isArray(req.requester)
            ? req.requester[0]?.name || "Unknown"
            : req.requester?.name || "Unknown",
          status: req.status,
          requestDate: req.requested_at
            ? new Date(req.requested_at).toLocaleDateString()
            : "Unknown",
          recordType: req.requested_record_types?.join(", ") || "N/A",
          reason: req.reason || "-",
          requestedDuration: req.requested_duration || 7,
          avatar:
            (Array.isArray(req.owner)
              ? req.owner[0]?.name?.[0]
              : req.owner?.name?.[0]) || "U",
          file_id: req.file_id || null,
        }));

        setAccessRequests(formatted);
      }
    } catch (err) {
      console.error("Unexpected error fetching access requests", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <ShieldCheck className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <ShieldAlert className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this access request?"
    );
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("access_control")
        .delete()
        .eq("id", requestId);

      if (error) {
        console.error("Error cancelling request:", error.message);
        alert("Failed to cancel request. Please try again.");
      } else {
        alert("Request cancelled successfully.");
        fetchAccessRequests();
      }
    } catch (err) {
      console.error("Unexpected error cancelling request:", err);
      alert("Something went wrong.");
    }
  };

  const handleResendRequest = async (oldRequest: AccessRequest) => {
    const confirmed = window.confirm(
      "Do you want to resend this access request?"
    );
    if (!confirmed) return;

    try {
      const { data: userData } = await supabase.auth.getUser();

      const { error } = await supabase.from("access_control").insert([
        {
          file_id: oldRequest.file_id,
          requester_id: userData?.user?.id,
          owner_id: oldRequest.patientId,
          status: "pending",
          reason: oldRequest.reason,
          requested_record_types: oldRequest.recordType.split(", "),
          requested_duration: oldRequest.requestedDuration,
        },
      ]);

      if (error) {
        console.error("Error resending request:", error.message);
        alert("Failed to resend request. Please try again.");
      } else {
        alert("Request resent successfully.");
        fetchAccessRequests();
      }
    } catch (err) {
      console.error("Unexpected error resending request:", err);
      alert("Something went wrong.");
    }
  };

  return (
    <Card className="border-blue-100 shadow-sm">
      <CardHeader>
        <CardTitle className="text-blue-800">Requested Access</CardTitle>
        <CardDescription>
          Track the status of your patient data access requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">
            Loading requests...
          </div>
        ) : accessRequests.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No access requests found.
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Request ID</TableHead>
                <TableHead>Record Type</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accessRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 border border-blue-200">
                        <AvatarImage
                          src={`/placeholder.svg?height=32&width=32`}
                          alt={request.patientName}
                        />
                        <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                          {request.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{request.patientName}</div>
                        <div className="text-xs text-muted-foreground">
                          ID: {request.patientId}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {request.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3 text-blue-600" />
                      <span>{request.recordType}</span>
                    </div>
                  </TableCell>
                  <TableCell>{request.requestDate}</TableCell>
                  <TableCell>{request.reason}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell className="text-right">
                    {request.status === "approved" ? (
                      <Button
                        onClick={() =>
                          router.push(
                            `/provider-dashboard/view-records/${request.id}`
                          )
                        }
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        View Records
                      </Button>
                    ) : request.status === "pending" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleCancelRequest(request.id)}
                      >
                        Cancel
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => handleResendRequest(request)}
                      >
                        Request Again
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
