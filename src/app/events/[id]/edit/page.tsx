"use client";

import { CMSLayout } from "@/components/cms/cms-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftIcon, SpinnerIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { EventForm } from "@/components/cms/event-form";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_URL } from "@/lib/config";
import type { Event } from "@/lib/types";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

export default function EditEventPage() {
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`${API_URL}/events/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setEvent(data);
        }
      } catch (error) {
        console.error("Failed to fetch event:", error);
        toast.error("Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.id]);

  return (
    <CMSLayout
      title="Edit Event"
      description="Update event details"
      actions={
        <Link href={`/events/${params.id}`} className="cursor-pointer">
          <Button
            variant="outline"
            className="rounded-lg bg-white hover:bg-zinc-50 border-zinc-200 h-9 text-xs sm:text-sm cursor-pointer px-4 shadow-sm transition-all"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Event
          </Button>
        </Link>
      }
    >
      <div className="bg-zinc-50/50 min-h-full">
        <Card className="max-w-3xl rounded-xl border-zinc-200/60 bg-white shadow-sm h-fit">
          <CardHeader className="border-b border-zinc-100/80 p-5 sm:px-6">
            <CardTitle className="text-lg font-semibold tracking-tight text-zinc-900">
              Event Details
            </CardTitle>
            <p className="text-sm text-zinc-500 mt-1">
              Update the information below to modify the event.
            </p>
          </CardHeader>
          <CardContent className="p-5 sm:p-6">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 text-zinc-400"
                >
                  <SpinnerIcon className="h-8 w-8 animate-spin mb-4 text-primary" />
                  <p className="text-sm font-medium">Loading event data...</p>
                </motion.div>
              ) : event ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <EventForm initialData={event} />
                </motion.div>
              ) : (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 text-center text-sm text-zinc-500"
                >
                  Event not found.
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </CMSLayout>
  );
}
