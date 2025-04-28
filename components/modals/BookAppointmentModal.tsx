"use client";

import { useState } from "react";
import { Calendar } from "../ui/calendar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { format } from "date-fns";

interface Provider {
  id: string;
  name: string;
  nationalId?: string;
}

interface BookAppointmentModalProps {
  provider: Provider;
  onClose: () => void;
}

export function BookAppointmentModal({ provider, onClose }: BookAppointmentModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [customTime, setCustomTime] = useState<string>("");

  const handleBooking = () => {
    if (!selectedDate || (!selectedTimeSlot && !customTime)) {
      alert("Please select both date and time slot!");
      return;
    }

    const appointmentTime = selectedTimeSlot === "Custom"
      ? customTime
      : selectedTimeSlot;

    // For now, we'll just console log. Later this will hit Supabase
    console.log({
      providerId: provider.id,
      providerName: provider.name,
      date: format(selectedDate, "yyyy-MM-dd"),
      timeSlot: appointmentTime,
    });

    alert("Appointment Requested Successfully! 🚀");
    onClose();
  };

  return (
    <div className="">
      {/* Title */}
      <h2 className="text-xl font-bold text-blue-700 text-center">
        Book Appointment with {provider.name}
      </h2>

      {/* Date Picker */}
      <div className="flex flex-col gap-2 item-center">
        <label className="text-sm font-semibold text-blue-600">Select Date</label>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border shadow"
        />
      </div>

      {/* Time Slot */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-blue-600">Select Time Slot</label>
        <Select onValueChange={(value) => setSelectedTimeSlot(value)}>
          <SelectTrigger className="bg-blue-50 border-blue-300 text-blue-700 focus:ring-blue-500">
            <SelectValue placeholder="Choose time slot" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10AM - 1PM">10AM - 1PM</SelectItem>
            <SelectItem value="1PM - 4PM">1PM - 4PM</SelectItem>
            <SelectItem value="4PM - 7PM">4PM - 7PM</SelectItem>
            <SelectItem value="Custom">Custom Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Custom Time Input */}
      {selectedTimeSlot === "Custom" && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-blue-600">Enter Custom Time</label>
          <Input
            placeholder="Eg: 2:30PM to 3:30PM"
            value={customTime}
            onChange={(e) => setCustomTime(e.target.value)}
            className="bg-blue-50 border-blue-300 focus-visible:ring-blue-500"
          />
        </div>
      )}

      {/* Book Appointment Button */}
      <Button
        onClick={handleBooking}
        className="bg-blue-600 hover:bg-blue-700 text-white w-full mt-4"
      >
        Book Appointment
      </Button>
    </div>
  );
}
