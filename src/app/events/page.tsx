"use client";

import { useEffect, useState, useMemo } from "react";
import { CMSLayout } from "@/components/cms/cms-layout";
import { Button } from "@/components/ui/button";
import { PlusIcon, TrashIcon, MagnifyingGlassIcon, CheckIcon, DownloadIcon } from "@phosphor-icons/react";
import { CustomCheckbox } from "@/components/cms/custom-checkbox";
import { ConfirmDialog } from "@/components/cms/confirm-dialog";
import Link from "next/link";
import { API_URL, CDN_URL } from "@/lib/config";
import { Event } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { useActorHeaders } from "@/lib/actor";
import { motion, AnimatePresence } from "motion/react";
import Papa from "papaparse";
import { toast } from "sonner";

export default function EventsPage() {
  const actorHeaders = useActorHeaders();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/events`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch-on-mount: setLoading(true) inside fetchEvents runs synchronously,
    // which the compiler's effect analysis can't distinguish from a loop-causing update.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const query = searchQuery.toLowerCase();
    return events.filter(e =>
      e.event_name.toLowerCase().includes(query) ||
      e.club_name?.toLowerCase().includes(query) ||
      e.event_type?.toLowerCase().includes(query)
    );
  }, [events, searchQuery]);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredEvents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredEvents.map((e) => e.id)));
    }
  };

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map(id =>
          fetch(`${API_URL}/events/${id}`, { method: "DELETE", headers: actorHeaders })
        )
      );
      toast.success(`${selectedIds.size} event${selectedIds.size === 1 ? "" : "s"} deleted`);
      setSelectedIds(new Set());
      setShowBulkDeleteConfirm(false);
      await fetchEvents();
    } catch (error) {
      console.error("Failed to delete events:", error);
      toast.error("Failed to delete events");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = () => {
    const eventsToExport = events.filter(e => selectedIds.has(e.id));
    if (eventsToExport.length === 0) return;

    const csvData = Papa.unparse(eventsToExport);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `technovit_events_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exported");
  };

  return (
    <CMSLayout
      title="Events"
      description="Manage all TechnoVIT events"
      actions={
        <div className="flex items-center gap-2">
          <Link href="/events/import">
            <Button variant="outline" className="h-9 text-xs sm:text-sm">
              Import
            </Button>
          </Link>
          <Link href="/events/new">
            <Button className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm shadow-sm transition-all active:scale-95">
              <PlusIcon className="mr-2 h-4 w-4" weight="bold" />
              New Event
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-80">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <AnimatePresence>
            {selectedIds.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="flex items-center gap-2 p-1.5 bg-white border border-zinc-200 rounded-lg shadow-sm"
              >
                <span className="text-xs font-medium text-zinc-600 px-2">
                  {selectedIds.size} selected
                </span>
                <div className="w-px h-4 bg-zinc-200 mx-1" />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleExportCSV}
                  className="h-7 text-xs text-zinc-600 hover:text-zinc-900 px-2"
                >
                  <DownloadIcon className="h-3.5 w-3.5 mr-1.5" />
                  Export
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBulkDeleteConfirm(true)}
                  disabled={isDeleting}
                  className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2"
                >
                  <TrashIcon className="h-3.5 w-3.5 mr-1.5" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Table */}
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 bg-zinc-50/80 border-b border-zinc-200 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">
                    <div className="flex justify-center">
                      <CustomCheckbox
                        checked={selectedIds.size > 0 && selectedIds.size === filteredEvents.length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </div>
                  </th>
                  <th className="px-4 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 font-medium">Club / Host</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Date & Time</th>
                  <th className="px-4 py-3 font-medium text-right w-24">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-4"><div className="h-4 w-4 bg-zinc-100 rounded mx-auto" /></td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-zinc-100 rounded-lg shrink-0" />
                          <div className="h-4 w-32 bg-zinc-100 rounded" />
                        </div>
                      </td>
                      <td className="px-4 py-4"><div className="h-4 w-24 bg-zinc-100 rounded" /></td>
                      <td className="px-4 py-4"><div className="h-5 w-16 bg-zinc-100 rounded-full" /></td>
                      <td className="px-4 py-4"><div className="h-4 w-36 bg-zinc-100 rounded" /></td>
                      <td className="px-4 py-4"><div className="h-4 w-12 bg-zinc-100 rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                      {searchQuery ? "No events match your search." : "No events found. Create one to get started!"}
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((event, idx) => {
                    const isSelected = selectedIds.has(event.id);
                    return (
                      <tr 
                        key={event.id}
                        className={`transition-all duration-300 starting:opacity-0 starting:translate-y-2 opacity-100 translate-y-0 ${
                          isSelected ? "bg-primary/5" : "hover:bg-zinc-50/50"
                        }`}
                        style={{ transitionDelay: `${Math.min(idx * 30, 300)}ms` }}
                      >
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                            <CustomCheckbox
                              checked={isSelected}
                              onCheckedChange={() => toggleSelect(event.id)}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/events/${event.id}`} className="flex items-center gap-3 group">
                            <div className="h-10 w-10 rounded-lg bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0">
                              {event.poster_path && (
                                <img
                                  src={`${CDN_URL}/${event.poster_path}`}
                                  alt={event.event_name}
                                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-zinc-900 group-hover:text-primary transition-colors">
                                {event.event_name}
                              </div>
                              {event.is_special_event ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 mt-0.5">
                                  <CheckIcon weight="bold" /> Special Event
                                </span>
                              ) : null}
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-zinc-600">{event.club_name || "-"}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex px-2 py-1 rounded-full bg-zinc-100 text-zinc-600 text-[11px] font-medium border border-zinc-200/50">
                            {event.event_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-600 whitespace-nowrap">
                          {formatDate(event.start_date_time)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-zinc-900">
                          {event.price_per_person === 0 ? "Free" : `₹${event.price_per_person}`}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showBulkDeleteConfirm}
        onOpenChange={setShowBulkDeleteConfirm}
        title={`Delete ${selectedIds.size} event${selectedIds.size === 1 ? "" : "s"}?`}
        description="This will permanently remove the selected events. This action cannot be undone."
        confirmLabel="Delete"
        loading={isDeleting}
        onConfirm={handleBulkDelete}
      />
    </CMSLayout>
  );
}
