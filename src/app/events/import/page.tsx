"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CMSLayout } from "@/components/cms/cms-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeftIcon, UploadSimpleIcon, SpinnerIcon, CheckCircleIcon, WarningIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { API_URL } from "@/lib/config";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

export default function ImportEventsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<{ success: number; failed: number } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResults(null);
    }
  };

  const processFile = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const data = await file.arrayBuffer();
      let jsonData: Record<string, unknown>[] = [];

      if (file.name.endsWith(".csv")) {
        const text = new TextDecoder().decode(data);
        const parsed = Papa.parse<Record<string, unknown>>(text, {
          header: true,
          skipEmptyLines: true,
        });
        jsonData = parsed.data;
      } else {
        const workbook = XLSX.read(data);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);
      }

      const formattedEvents = jsonData.map((row) => ({
        event_name: row["event_name"] || row["Event Name"] || "",
        club_name: row["club_name"] || row["Club Name"] || "",
        event_type: row["event_type"] || row["Event Type"] || "",
        event_for: row["event_for"] || row["Event For"] || "Both",
        start_date_time: row["start_date_time"] || row["Start Time"] || "",
        end_date_time: row["end_date_time"] || row["End Time"] || "",
        price_per_person: Number(row["price_per_person"] || row["Price"] || 0),
        participation_type: row["participation_type"] || row["Participation"] || "",
        event_venue: row["event_venue"] || row["Venue"] || "",
        short_description: row["short_description"] || row["Short Description"] || "",
        long_description: row["long_description"] || row["Long Description"] || "",
        is_special_event: row["is_special_event"] === "true" || row["Special"] === "Yes" ? 1 : 0,
        registration_link: row["registration_link"] || row["Link"] || "",
        team_size: row["team_size"] || row["Team Size"] || "",
        faculty_coord_emp_id: row["faculty_coord_emp_id"] || row["Faculty Coordinator Emp ID"] || "",
        faculty_coord_name: row["faculty_coord_name"] || row["Faculty Coordinator Name"] || "",
        faculty_coord_mobile: row["faculty_coord_mobile"] || row["Faculty Coordinator Mobile"] || "",
        faculty_coord_email: row["faculty_coord_email"] || row["Faculty Coordinator Email"] || "",
      }));

      let successCount = 0;
      let failedCount = 0;

      for (const event of formattedEvents) {
        if (!event.event_name || !event.start_date_time) {
          failedCount++;
          continue;
        }

        try {
          const res = await fetch(`${API_URL}/events`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(event),
          });
          if (res.ok) {
            successCount++;
          } else {
            failedCount++;
          }
        } catch {
          failedCount++;
        }
      }

      setResults({ success: successCount, failed: failedCount });
      if (failedCount === 0 && successCount > 0) {
        setTimeout(() => router.push("/events"), 2000);
      }
    } catch (error) {
      console.error("Failed to process file:", error);
      toast.error("Failed to process the file. Check its format and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      {
        event_name: "Sample Event",
        club_name: "Computer Society",
        event_type: "Workshop",
        event_for: "VITian",
        start_date_time: "2024-03-15 10:00:00",
        end_date_time: "2024-03-15 17:00:00",
        price_per_person: 100,
        participation_type: "Solo",
        event_venue: "Anna Auditorium",
        short_description: "A brief description here",
        long_description: "Detailed description here",
        is_special_event: "false",
        registration_link: "https://example.com",
        team_size: "1",
        faculty_coord_emp_id: "EMP1234",
        faculty_coord_name: "Dr. Jane Doe",
        faculty_coord_mobile: "9876543210",
        faculty_coord_email: "jane.doe@vit.ac.in",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Events");
    XLSX.writeFile(wb, "technovit_events_template.xlsx");
  };

  return (
    <CMSLayout
      title="Import Events"
      description="Upload events in bulk via CSV or Excel"
      actions={
        <Link href="/events" className="cursor-pointer">
          <Button
            variant="outline"
            className="rounded-lg bg-white hover:bg-zinc-50 border-zinc-200 h-9 text-xs sm:text-sm cursor-pointer px-4 shadow-sm transition-all"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </Link>
      }
    >
      <div className="bg-zinc-50/50 min-h-full">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="rounded-xl border-zinc-200/60 bg-white shadow-sm overflow-hidden">
            <CardHeader className="border-b border-zinc-100/80 p-5 sm:px-6 bg-white">
              <CardTitle className="text-lg font-semibold tracking-tight text-zinc-900">
                Bulk Import
              </CardTitle>
              <CardDescription>
                Download the template, fill it out, and upload it here. Supported formats: .csv, .xlsx, .xls
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 space-y-6">
              <div className="flex justify-center">
                <Button variant="outline" onClick={handleDownloadTemplate} className="h-9 text-sm shadow-sm">
                  Download Template
                </Button>
              </div>

              <div className="border-t border-zinc-100 pt-6">
                <AnimatePresence mode="popLayout">
                  {results ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-6 rounded-xl border border-zinc-200 bg-white text-center shadow-sm"
                    >
                      <div className="flex justify-center mb-4">
                        {results.failed === 0 ? (
                          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <CheckCircleIcon className="h-8 w-8" weight="fill" />
                          </div>
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                            <WarningIcon className="h-8 w-8" weight="fill" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-zinc-900 mb-2">Import Complete</h3>
                      <div className="flex justify-center gap-6 text-sm">
                        <div className="text-green-600 font-medium">
                          {results.success} Successful
                        </div>
                        <div className={results.failed > 0 ? "text-red-600 font-medium" : "text-zinc-500 font-medium"}>
                          {results.failed} Failed
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-center gap-3">
                        <Button variant="outline" onClick={() => setResults(null)}>
                          Import Another File
                        </Button>
                        <Link href="/events">
                          <Button>Go to Events</Button>
                        </Link>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      <label className="flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-zinc-200 p-10 hover:border-primary/50 hover:bg-primary/5 bg-zinc-50/50 transition-colors">
                        <div className="h-14 w-14 rounded-full bg-white shadow-sm border border-zinc-100 flex items-center justify-center text-zinc-400">
                          <UploadSimpleIcon className="h-7 w-7" />
                        </div>
                        <div className="text-center">
                          <span className="text-base font-semibold text-primary block">
                            {file ? file.name : "Click to select a file"}
                          </span>
                          <span className="text-sm text-zinc-500 mt-1 block">
                            {file ? `${(file.size / 1024).toFixed(2)} KB` : "CSV or Excel files only"}
                          </span>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                          onChange={handleFileUpload}
                        />
                      </label>

                      <div className="flex justify-end">
                        <Button 
                          onClick={processFile} 
                          disabled={!file || loading}
                          className="w-full sm:w-auto min-w-[140px]"
                        >
                          {loading ? (
                            <>
                              <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            "Import Events"
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CMSLayout>
  );
}
