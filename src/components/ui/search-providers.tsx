"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"; // 👈 added DialogTitle
import { BookAppointmentModal } from "@/components/modals/BookAppointmentModal";
import { supabase } from "@/lib/supabaseClient";

interface Provider {
  id: string;
  name: string;
  nationalId?: string;
}

export function SearchProviders() {
  const [query, setQuery] = useState("");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      if (query.length < 2) {
        setProviders([]);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("id, name, nationalId")
        .or(`name.ilike.%${query}%, nationalId.ilike.%${query}%`)
        .eq("role", "Provider")
        .limit(10);

      if (error) {
        console.error("Error fetching providers:", error);
      } else {
        setProviders(data || []);
      }
    };

    fetchProviders();
  }, [query]);

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Search Providers by Name or Medical ID"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-64 bg-slate-50 focus-visible:ring-blue-500 static"
      />

      {providers.length > 0 && (
        <div className="bg-white border rounded shadow p-2 max-h-60 overflow-y-auto">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="p-2 hover:bg-gray-100 cursor-pointer rounded"
              onClick={() => setSelectedProvider(provider)}
            >
              {provider.name} {provider.nationalId ? `• ${provider.nationalId}` : ""}
            </div>
          ))}
        </div>
      )}

      {selectedProvider && (
        <Dialog open={true} onOpenChange={() => setSelectedProvider(null)}>
          <DialogContent className="max-w-md">
            <BookAppointmentModal
              provider={selectedProvider}
              onClose={() => setSelectedProvider(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
