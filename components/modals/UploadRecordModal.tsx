"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { CalendarIcon, UploadCloud } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export function UploadRecordModal({
  open,
  onOpenChange,
  onUploadSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess: () => Promise<void>;
}) {
  const [recordType, setRecordType] = useState("");
  const [recordName, setRecordName] = useState("");
  const [recordDate, setRecordDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!recordType || !recordName || !recordDate || !file) {
      alert("Please fill all fields and select a file.");
      return;
    }
  
    setUploading(true);
    const { data: user } = await supabase.auth.getUser();

  
    try {
      const filename = `${Date.now()}-${file.name}`;
  
      // Upload to Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("patient-records")
        .upload(`public/${filename}`, file);
  
      if (uploadError) {
        console.error("Upload error:", uploadError.message);
        alert("Failed to upload file.");
        setUploading(false);
        return;
      }
  
      if (!uploadData?.path) {
        console.error("Upload succeeded but no path returned.");
        alert("Unexpected error during file upload.");
        setUploading(false);
        return;
      }
  
      const filePath = uploadData.path; // Correct uploaded file path
  
      // Insert into patient_records WITHOUT user_id
      const { error: insertError } = await supabase
        .from("patient_records")
        .insert([
          {
            patient_email: localStorage.getItem("lastLoggedInEmail"),
            record_type: recordType,
            record_name: recordName,
            record_date: recordDate,
            file_url: filePath,
            user_id: user?.user?.id,
          }
        ]);
  
      if (insertError) {
        console.error("Insert error:", insertError.message);
        alert("Failed to save record in database.");
        setUploading(false);
        return;
      }
  
      alert("Record uploaded successfully.");
      onOpenChange(false); // Close modal
      onUploadSuccess();   // Refresh records
      resetForm();
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("Unexpected error occurred.");
    } finally {
      setUploading(false);
    }
  };
    

  const resetForm = () => {
    setRecordType("");
    setRecordName("");
    setRecordDate("");
    setFile(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-blue-800">Upload New Health Record</DialogTitle>
          <DialogDescription>
            Upload a new health record to your secure blockchain storage.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Record Type */}
          <div className="grid gap-2">
            <Label htmlFor="recordType">Record Type</Label>
            <select
              id="recordType"
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="">Select record type</option>
              <option value="Laboratory Results">Laboratory Results</option>
              <option value="Imaging/Radiology">Imaging/Radiology</option>
              <option value="Visit Summary">Visit Summary</option>
              <option value="Prescription">Prescription</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Record Name */}
          <div className="grid gap-2">
            <Label htmlFor="recordName">Record Name</Label>
            <Input
              id="recordName"
              placeholder="e.g., Annual Blood Work Results"
              value={recordName}
              onChange={(e) => setRecordName(e.target.value)}
            />
          </div>

          {/* Record Date */}
          <div className="grid gap-2">
            <Label htmlFor="recordDate">Record Date</Label>
            <div className="relative">
              <Input
                id="recordDate"
                type="date"
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
                className="pr-10"
              />
              <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Upload File */}
          <div className="grid gap-2">
            <Label>Upload File</Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center text-gray-500 cursor-pointer hover:bg-gray-50"
            >
              <UploadCloud className="h-10 w-10 mb-2 text-blue-600" />
              <p className="text-sm">Drag and drop or click to upload</p>
              <p className="text-xs mt-1 text-gray-400">PDF, JPG, PNG up to 10MB</p>
            </div>

            {/* Hidden file input */}
            <Input
              ref={fileInputRef}
              type="file"
              accept=".pdf, .jpg, .jpeg, .png"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                }
              }}
            />
            {file && <p className="text-xs text-green-600 mt-2">Selected file: {file.name}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload Record"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
