import { Eye, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function HealthRecordsCard() {
  const records = [
    { id: 1, name: "Annual Physical", date: "Mar 15, 2024", type: "Examination" },
    { id: 2, name: "Blood Test Results", date: "Feb 28, 2024", type: "Laboratory" },
    { id: 3, name: "Vaccination Record", date: "Jan 10, 2024", type: "Immunization" },
  ]

  return (
    <Card className="border-blue-100 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-blue-800">My Health Records</CardTitle>
        <CardDescription>Your recent medical records</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {records.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between rounded-lg border border-blue-100 p-3 text-sm"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">{record.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {record.date} • {record.type}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Eye className="h-4 w-4" />
                <span className="sr-only">View</span>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700">
          <Eye className="mr-2 h-4 w-4" />
          View All Records
        </Button>
      </CardFooter>
    </Card>
  )
}
