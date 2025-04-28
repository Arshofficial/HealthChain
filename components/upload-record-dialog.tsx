"use client"

import type React from "react"

import { useState } from "react"
import { FileUp, Upload } from "lucide-react"

import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

interface UploadRecordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UploadRecordDialog({ open, onOpenChange }: UploadRecordDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = () => {
    if (!file) return

    setUploading(true)

    // Simulate upload
    setTimeout(() => {
      setUploading(false)
      onOpenChange(false)
      setFile(null)
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-blue-800">Upload New Health Record</DialogTitle>
          <DialogDescription>Upload a new health record to your secure blockchain storage.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="record-type">Record Type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select record type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lab">Laboratory Results</SelectItem>
                <SelectItem value="imaging">Imaging/Radiology</SelectItem>
                <SelectItem value="visit">Visit Summary</SelectItem>
                <SelectItem value="prescription">Prescription</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="record-name">Record Name</Label>
            <Input id="record-name" placeholder="e.g., Annual Blood Work Results" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="record-date">Record Date</Label>
            <Input id="record-date" type="date" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="file-upload">Upload File</Label>
            <div className="flex items-center gap-2">
              <div className="grid w-full gap-2">
                <Label
                  htmlFor="file-upload"
                  className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-blue-300 bg-blue-50 px-4 py-5 text-center hover:bg-blue-100"
                >
                  <FileUp className="h-8 w-8 text-blue-500" />
                  <div className="mt-2 text-sm text-blue-800">
                    {file ? file.name : "Drag and drop or click to upload"}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{!file && "PDF, JPG, PNG up to 10MB"}</div>
                  <Input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </Label>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || uploading} className="bg-blue-600 hover:bg-blue-700">
            {uploading ? (
              <>Uploading...</>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Record
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
