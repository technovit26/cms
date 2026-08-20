"use client";

import { Fragment, useEffect, useState } from "react";
import { CMSLayout } from "@/components/cms/cms-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowCounterClockwiseIcon,
  CaretDownIcon,
  PlusCircleIcon,
  PencilSimpleIcon,
  TrashIcon,
  SpinnerIcon,
} from "@phosphor-icons/react";
import { API_URL } from "@/lib/config";
import { useActorHeaders } from "@/lib/actor";
import type { ActivityAction, ActivityLog } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

const ACTION_META: Record<ActivityAction, { label: string; className: string; icon: typeof PlusCircleIcon }> = {
  create: { label: "Created", className: "bg-green-100 text-green-700 border-green-200/50", icon: PlusCircleIcon },
  update: { label: "Updated", className: "bg-blue-100 text-blue-700 border-blue-200/50", icon: PencilSimpleIcon },
  delete: { label: "Deleted", className: "bg-red-100 text-red-700 border-red-200/50", icon: TrashIcon },
  restore: { label: "Restored", className: "bg-amber-100 text-amber-700 border-amber-200/50", icon: ArrowCounterClockwiseIcon },
};

function parseChanges(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function ChangeSummary({ log }: { log: ActivityLog }) {
  const parsed = parseChanges(log.changes);
  if (!parsed) return <span className="text-zinc-400">—</span>;

  if (log.action === "update") {
    const fields = Object.keys(parsed);
    if (fields.length === 0) return <span className="text-zinc-400">No field changes</span>;
    return (
      <span className="text-zinc-600">
        Changed {fields.length} field{fields.length === 1 ? "" : "s"}:{" "}
        <span className="text-zinc-500">{fields.slice(0, 3).join(", ")}{fields.length > 3 ? `, +${fields.length - 3} more` : ""}</span>
      </span>
    );
  }
  if (log.action === "create") return <span className="text-zinc-500">New event created</span>;
  if (log.action === "delete") return <span className="text-zinc-500">Event moved to trash</span>;
  if (log.action === "restore") return <span className="text-zinc-500">Event restored from trash</span>;
  return null;
}

function ChangeDetails({ log }: { log: ActivityLog }) {
  const parsed = parseChanges(log.changes);
  if (!parsed) return null;

  if (log.action === "update") {
    const entries = Object.entries(parsed) as [string, { old: unknown; new: unknown }][];
    if (entries.length === 0) return null;
    return (
      <div className="space-y-1.5">
        {entries.map(([field, { old, new: next }]) => (
          <div key={field} className="flex flex-wrap items-baseline gap-1.5 text-xs">
            <span className="font-medium text-zinc-700">{field}:</span>
            <span className="text-red-600 line-through">{String(old ?? "—")}</span>
            <span className="text-zinc-400">→</span>
            <span className="text-green-700">{String(next ?? "—")}</span>
          </div>
        ))}
      </div>
    );
  }

  const snapshot = (parsed.snapshot ?? parsed.after) as Record<string, unknown> | undefined;
  if (!snapshot) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-zinc-600">
      {["event_name", "club_name", "event_type", "event_venue", "start_date_time"].map((key) =>
        snapshot[key] ? (
          <div key={key}>
            <span className="font-medium text-zinc-700">{key}:</span> {String(snapshot[key])}
          </div>
        ) : null
      )}
    </div>
  );
}

function ActionBadge({ action }: { action: ActivityAction }) {
  const meta = ACTION_META[action];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border shrink-0",
        meta.className
      )}
    >
      <meta.icon className="h-3.5 w-3.5" weight="bold" />
      {meta.label}
    </span>
  );
}

function EntityLink({ log }: { log: ActivityLog }) {
  const label = log.entity_name || `Event #${log.entity_id}`;
  if (log.action === "delete" || (log.action === "update" && log.undone === 1)) {
    return <span className="font-medium text-zinc-900">{label}</span>;
  }
  return (
    <Link
      href={`/events/${log.entity_id}`}
      onClick={(e) => e.stopPropagation()}
      className="font-medium text-zinc-900 hover:text-primary transition-colors"
    >
      {label}
    </Link>
  );
}

export default function ActivityLogPage() {
  const actorHeaders = useActorHeaders();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [undoingId, setUndoingId] = useState<number | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/activity-logs?entity_type=event&limit=100`);
      if (res.ok) {
        setLogs(await res.json());
      } else {
        toast.error("Failed to load activity log");
      }
    } catch (error) {
      console.error("Failed to fetch activity log:", error);
      toast.error("Failed to load activity log");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLogs();
  }, []);

  const handleUndo = async (log: ActivityLog) => {
    setUndoingId(log.id);
    try {
      const res = await fetch(`${API_URL}/activity-logs/${log.id}/undo`, {
        method: "POST",
        headers: actorHeaders,
      });
      if (res.ok) {
        toast.success(`"${log.entity_name || "Event"}" restored`);
        await fetchLogs();
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Failed to undo deletion");
      }
    } catch (error) {
      console.error("Failed to undo deletion:", error);
      toast.error("Failed to undo deletion");
    } finally {
      setUndoingId(null);
    }
  };

  const UndoControl = ({ log }: { log: ActivityLog }) => {
    if (log.action === "delete" && log.undone !== 1) {
      return (
        <Button
          variant="outline"
          size="sm"
          disabled={undoingId === log.id}
          onClick={() => handleUndo(log)}
          className="h-7 text-xs shrink-0"
        >
          {undoingId === log.id ? (
            <SpinnerIcon className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              <ArrowCounterClockwiseIcon className="h-3.5 w-3.5 mr-1.5" />
              Undo
            </>
          )}
        </Button>
      );
    }
    if (log.action === "delete" && log.undone === 1) {
      return <span className="text-[11px] text-zinc-400 shrink-0">Restored</span>;
    }
    return null;
  };

  return (
    <CMSLayout
      title="Activity Log"
      description="Every change made to events, and who made it"
    >
      {/* Mobile: card list */}
      <div className="sm:hidden space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-zinc-200 rounded-xl p-4 animate-pulse space-y-3">
              <div className="h-5 w-20 bg-zinc-100 rounded-full" />
              <div className="h-4 w-2/3 bg-zinc-100 rounded" />
              <div className="h-3 w-full bg-zinc-100 rounded" />
            </div>
          ))
        ) : logs.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center text-sm text-zinc-500">
            No activity recorded yet.
          </div>
        ) : (
          logs.map((log) => {
            const isExpanded = expandedId === log.id;
            return (
              <div key={log.id} className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  className="w-full text-left p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <ActionBadge action={log.action} />
                    <CaretDownIcon
                      className={cn("h-4 w-4 text-zinc-400 transition-transform shrink-0 mt-1", isExpanded ? "rotate-180" : "")}
                    />
                  </div>
                  <div className="text-sm">
                    <EntityLink log={log} />
                  </div>
                  <div className="text-xs text-zinc-600">
                    <ChangeSummary log={log} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
                    <span>{log.actor_name || log.actor_email || "Unknown"}</span>
                    <span>{formatDate(log.created_at)}</span>
                  </div>
                </button>
                {isExpanded && (
                  <div className="border-t border-zinc-100 bg-zinc-50/60 p-4">
                    <ChangeDetails log={log} />
                  </div>
                )}
                <div className="border-t border-zinc-100 p-3 flex justify-end" onClick={(e) => e.stopPropagation()}>
                  <UndoControl log={log} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop / tablet: table */}
      <div className="hidden sm:block bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 bg-zinc-50/80 border-b border-zinc-200 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 font-medium w-10" />
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Summary</th>
                <th className="px-4 py-3 font-medium">By</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">When</th>
                <th className="px-4 py-3 font-medium text-right w-28">Undo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4" />
                    <td className="px-4 py-4"><div className="h-5 w-20 bg-zinc-100 rounded-full" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-32 bg-zinc-100 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-40 bg-zinc-100 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-24 bg-zinc-100 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-28 bg-zinc-100 rounded" /></td>
                    <td className="px-4 py-4" />
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                    No activity recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isExpanded = expandedId === log.id;
                  return (
                    <Fragment key={log.id}>
                      <tr
                        className="hover:bg-zinc-50/50 transition-colors cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : log.id)}
                      >
                        <td className="px-4 py-3 text-zinc-400">
                          <CaretDownIcon
                            className={cn("h-3.5 w-3.5 transition-transform", isExpanded ? "rotate-180" : "")}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <ActionBadge action={log.action} />
                        </td>
                        <td className="px-4 py-3">
                          <EntityLink log={log} />
                        </td>
                        <td className="px-4 py-3 text-zinc-600">
                          <ChangeSummary log={log} />
                        </td>
                        <td className="px-4 py-3 text-zinc-600">
                          {log.actor_name || log.actor_email || "Unknown"}
                        </td>
                        <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">{formatDate(log.created_at)}</td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <UndoControl log={log} />
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-zinc-50/60">
                          <td />
                          <td colSpan={6} className="px-4 py-3">
                            <ChangeDetails log={log} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </CMSLayout>
  );
}
