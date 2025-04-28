"use client";

import { useState } from "react";
import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabaseClient";

interface RequestAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: any;
}

export function RequestAccessDialog({ open, onOpenChange, patient }: RequestAccessDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [accessDuration, setAccessDuration] = useState("24h");
  const [customDays, setCustomDays] = useState<number>(1); // For custom duration input

  if (!patient) return null;

  const parseDurationToDays = (value: string) => {
    if (value === "24h") return 1;
    if (value === "7d") return 7;
    if (value === "30d") return 30;
    if (value === "custom") return customDays;
    return 1; // fallback default
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const form = new FormData(e.target as HTMLFormElement);

      const reason = form.get("reason") as string;
      const consent = form.get("consent") === "on";
      const recordTypes = form.getAll("record_types") as string[];

      if (!consent) {
        alert("You must confirm that you have a legitimate reason to access records.");
        setSubmitting(false);
        return;
      }

      const requestedDurationInDays = parseDurationToDays(accessDuration);

      const { data: userData, error: authError } = await supabase.auth.getUser();

      if (authError || !userData?.user?.id) {
        throw new Error("Authentication failed. Please login again.");
      }

      const { error } = await supabase.from("access_control").insert([
        {
          file_id: null,
          requester_id: userData.user.id,
          owner_id: patient.id,
          status: "pending",
          reason: reason,
          requested_duration: requestedDurationInDays,
          requested_record_types: recordTypes,
          granted_by: null,
        },
      ]);

      if (error) {
        throw error;
      }

      alert("Access request submitted successfully!");
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error submitting access request:", err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-blue-800">Request Patient Record Access</DialogTitle>
          <DialogDescription>
            Submit a request to access this patient's health records on the blockchain
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Patient Details */}
            <div className="flex items-center gap-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
              <Avatar className="h-12 w-12 border border-blue-200">
                <AvatarImage src={`/placeholder.svg?height=48&width=48`} alt={patient?.name} />
                <AvatarFallback className="bg-blue-100 text-blue-800">{patient?.avatar}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-blue-900">{patient?.name}</div>
                <div className="text-sm text-blue-700">
                  ID: {patient?.id} • DOB: {patient?.dob} • {patient?.gender}
                </div>
                <div className="text-sm text-blue-700">Health ID: {patient?.healthId}</div>
              </div>
            </div>

            {/* Reason */}
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason for Access</Label>
              <Textarea
                id="reason"
                name="reason"
                placeholder="Explain why you need access to this patient's records"
                required
                className="resize-none"
                rows={3}
              />
            </div>

            {/* Records Requested */}
            <div className="grid gap-2">
              <Label>Records Requested</Label>
              <div className="space-y-2">
                {["Complete Medical History", "Laboratory Results", "Medication History", "Imaging & Radiology", "Surgical History"].map(
                  (type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox id={type} name="record_types" value={type} />
                      <Label htmlFor={type} className="text-sm font-normal">
                        {type}
                      </Label>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Access Duration */}
            <div className="grid gap-2">
              <Label>Access Duration</Label>
              <RadioGroup
                value={accessDuration}
                onValueChange={(value) => setAccessDuration(value)}
                className="flex flex-wrap gap-2"
              >
                {[
                  { value: "24h", label: "24 Hours" },
                  { value: "7d", label: "7 Days" },
                  { value: "30d", label: "30 Days" },
                  { value: "custom", label: "Custom" },
                ].map(({ value, label }) => (
                  <div key={value} className="flex items-center space-x-2 border border-blue-100 rounded-md p-2">
                    <RadioGroupItem value={value} id={`duration-${value}`} />
                    <Label htmlFor={`duration-${value}`} className="text-sm font-normal">
                      {label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {accessDuration === "custom" && (
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    type="number"
                    min="1"
                    placeholder="Number of days"
                    className="w-32"
                    value={customDays}
                    onChange={(e) => setCustomDays(Number(e.target.value))}
                  />
                  <span className="text-sm text-muted-foreground">days</span>
                </div>
              )}
            </div>

            {/* Consent */}
            <div className="flex items-start space-x-2 mt-2">
              <Checkbox id="consent" name="consent" required />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="consent" className="text-sm font-normal leading-snug text-muted-foreground">
                  I confirm that I have a legitimate medical reason to access this patient's records and will comply
                  with all privacy regulations.
                </Label>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
              {submitting ? (
                <>Submitting Request...</>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Submit Access Request
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
