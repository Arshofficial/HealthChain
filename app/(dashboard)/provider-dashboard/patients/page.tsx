import { MyPatientsTable } from "../../../../components/ui/my-patients-table";

export default function MyPatientsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">My Patients</h2>
        <p className="text-muted-foreground">
          Patients currently under your care
        </p>
      </div>

      {/* Patients Table */}
      <MyPatientsTable />
    </div>
  );
}
