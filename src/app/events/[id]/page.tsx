"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CMSLayout } from "@/components/cms/cms-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/cms/confirm-dialog";
import {
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  PencilSimpleIcon,
  SpinnerIcon,
  TrashIcon,
  UsersIcon,
  TicketIcon,
  LinkIcon,
  IdentificationCardIcon,
  EnvelopeIcon,
  PhoneIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { API_URL, CDN_URL } from "@/lib/config";
import type { Event } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

export default function EventPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_URL}/events/${params.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Event deleted");
        router.push("/events");
      } else {
        toast.error("Failed to delete event");
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Failed to delete event:", error);
      toast.error("Failed to delete event");
      setIsDeleting(false);
    }
  };

  return (
    <CMSLayout
      title="Event Details"
      description="View and manage event information"
      actions={
        <div className="flex items-center gap-2">
          <Link href="/events" className="cursor-pointer">
            <Button
              variant="outline"
              className="rounded-lg bg-white hover:bg-zinc-50 border-zinc-200 h-9 text-xs sm:text-sm cursor-pointer shadow-sm transition-all"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </Link>
          {event && (
            <>
              <Link href={`/events/${event.id}/edit`} className="cursor-pointer">
                <Button className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm shadow-sm transition-all active:scale-95">
                  <PencilSimpleIcon className="mr-2 h-4 w-4" weight="bold" />
                  Edit Event
                </Button>
              </Link>
              <Button
                variant="destructive"
                className="h-9 text-xs sm:text-sm shadow-sm transition-all active:scale-95"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <SpinnerIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <TrashIcon className="mr-2 h-4 w-4" weight="bold" />
                    Delete
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      }
    >
      <div className="min-h-full">
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
              <p className="text-sm font-medium">Loading event details...</p>
            </motion.div>
          ) : event ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="rounded-xl border-zinc-200/60 bg-white shadow-sm overflow-hidden">
                  <div className="h-32 sm:h-48 bg-gradient-to-r from-primary/10 to-purple-500/10 relative">
                    {Boolean(event.is_special_event) && (
                      <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wide">
                        Special Event
                      </div>
                    )}
                  </div>
                  
                  <div className="px-6 pb-6 -mt-16 sm:-mt-24">
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="h-32 w-32 sm:h-48 sm:w-48 rounded-xl border-4 border-white bg-white shadow-md overflow-hidden shrink-0 flex items-center justify-center relative">
                        {event.poster_path ? (
                          <img
                            src={`${CDN_URL}/${event.poster_path}`}
                            alt={event.event_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <CalendarIcon className="h-12 w-12 text-zinc-300" />
                        )}
                      </div>
                      
                      <div className="pt-2 sm:pt-24 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold border border-primary/20 uppercase tracking-wider">
                            {event.event_type}
                          </span>
                          <span className="inline-flex px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 text-[11px] font-semibold border border-zinc-200/50 uppercase tracking-wider">
                            {event.event_for}
                          </span>
                        </div>
                        
                        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight leading-tight">
                          {event.event_name}
                        </h1>
                        
                        <p className="text-lg text-zinc-600 mt-1 font-medium">
                          by {event.club_name || "Unknown Club"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-zinc-500 font-medium text-sm">
                          <CalendarIcon className="h-4 w-4" weight="bold" />
                          Start Time
                        </div>
                        <p className="text-zinc-900 font-medium pl-6">
                          {formatDate(event.start_date_time)}
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-zinc-500 font-medium text-sm">
                          <CalendarIcon className="h-4 w-4" weight="bold" />
                          End Time
                        </div>
                        <p className="text-zinc-900 font-medium pl-6">
                          {formatDate(event.end_date_time)}
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-zinc-500 font-medium text-sm">
                          <MapPinIcon className="h-4 w-4" weight="bold" />
                          Venue
                        </div>
                        <p className="text-zinc-900 font-medium pl-6">
                          {event.event_venue || "TBA"}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-zinc-500 font-medium text-sm">
                          <TicketIcon className="h-4 w-4" weight="bold" />
                          Registration
                        </div>
                        <div className="pl-6 pt-0.5">
                          {event.registration_link ? (
                            <a 
                              href={event.registration_link} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-primary hover:underline font-medium text-sm flex items-center gap-1"
                            >
                              Register Link <LinkIcon className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-zinc-500 text-sm">No link provided</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="rounded-xl border-zinc-200/60 bg-white shadow-sm">
                  <CardHeader className="border-b border-zinc-100/80 p-5">
                    <CardTitle className="text-lg font-semibold text-zinc-900">
                      About Event
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5">
                    <div className="space-y-4 text-zinc-700 text-sm leading-relaxed whitespace-pre-wrap">
                      <p className="text-base font-medium text-zinc-900">
                        {event.short_description}
                      </p>
                      <p>
                        {event.long_description || "No detailed description provided."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="rounded-xl border-zinc-200/60 bg-white shadow-sm">
                  <CardHeader className="border-b border-zinc-100/80 p-5">
                    <CardTitle className="text-lg font-semibold text-zinc-900">
                      Registration Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                          <TicketIcon className="h-5 w-5 text-green-600" weight="fill" />
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Price</p>
                          <p className="text-lg font-bold text-zinc-900">
                            {event.price_per_person === 0 ? "Free" : `₹${event.price_per_person}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <UsersIcon className="h-5 w-5 text-blue-600" weight="fill" />
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Participation</p>
                          <p className="text-sm font-semibold text-zinc-900">
                            {event.participation_type || "Individual"}
                          </p>
                        </div>
                      </div>

                      {event.team_size && (
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                            <UsersIcon className="h-5 w-5 text-purple-600" weight="fill" />
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Team Size</p>
                            <p className="text-sm font-semibold text-zinc-900">
                              {event.team_size} members
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {(event.faculty_coord_name || event.faculty_coord_emp_id || event.faculty_coord_mobile || event.faculty_coord_email) && (
                  <Card className="rounded-xl border-zinc-200/60 bg-white shadow-sm">
                    <CardHeader className="border-b border-zinc-100/80 p-5">
                      <CardTitle className="text-lg font-semibold text-zinc-900">
                        Faculty Coordinator
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                      <div className="space-y-4">
                        {event.faculty_coord_name && (
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                              <IdentificationCardIcon className="h-5 w-5 text-zinc-600" weight="fill" />
                            </div>
                            <div>
                              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Name</p>
                              <p className="text-sm font-semibold text-zinc-900">
                                {event.faculty_coord_name}
                                {event.faculty_coord_emp_id && (
                                  <span className="text-zinc-500 font-normal"> ({event.faculty_coord_emp_id})</span>
                                )}
                              </p>
                            </div>
                          </div>
                        )}

                        {event.faculty_coord_mobile && (
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                              <PhoneIcon className="h-5 w-5 text-zinc-600" weight="fill" />
                            </div>
                            <div>
                              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Mobile</p>
                              <a
                                href={`tel:${event.faculty_coord_mobile}`}
                                className="text-sm font-semibold text-zinc-900 hover:text-primary"
                              >
                                {event.faculty_coord_mobile}
                              </a>
                            </div>
                          </div>
                        )}

                        {event.faculty_coord_email && (
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                              <EnvelopeIcon className="h-5 w-5 text-zinc-600" weight="fill" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Email</p>
                              <a
                                href={`mailto:${event.faculty_coord_email}`}
                                className="text-sm font-semibold text-zinc-900 hover:text-primary truncate block"
                              >
                                {event.faculty_coord_email}
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center"
            >
              <h2 className="text-xl font-bold text-zinc-900 mb-2">Event Not Found</h2>
              <p className="text-zinc-500 mb-6">The event you are looking for doesn&apos;t exist or has been deleted.</p>
              <Link href="/events">
                <Button variant="outline">Return to Events</Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete this event?"
        description="This will permanently remove the event. This action cannot be undone."
        confirmLabel="Delete"
        loading={isDeleting}
        onConfirm={handleDelete}
      />
    </CMSLayout>
  );
}
