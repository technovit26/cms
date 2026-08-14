"use client";

import { CMSLayout } from "@/components/cms/cms-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  UsersIcon,
  ImageSquareIcon,
  PlusIcon,
  ArrowRightIcon,
  TicketIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Event } from "@/lib/types";
import { API_URL, CDN_URL } from "@/lib/config";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    pastEvents: 0,
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_URL}/events`);
        if (res.ok) {
          const data: Event[] = await res.json();
          setEvents(data);

          const now = new Date();
          let upcoming = 0;
          let past = 0;

          data.forEach((event) => {
            if (new Date(event.start_date_time) > now) {
              upcoming++;
            } else {
              past++;
            }
          });

          setStats({
            totalEvents: data.length,
            upcomingEvents: upcoming,
            pastEvents: past,
          });
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const statCards = [
    {
      title: "Total Events",
      value: stats.totalEvents,
      icon: CalendarIcon,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      delay: "delay-0",
    },
    {
      title: "Upcoming",
      value: stats.upcomingEvents,
      icon: TicketIcon,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      delay: "delay-75",
    },
    {
      title: "Past Events",
      value: stats.pastEvents,
      icon: UsersIcon,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      delay: "delay-150",
    },
  ];

  return (
    <CMSLayout
      title="Dashboard"
      description="Overview of TechnoVIT events and media."
      actions={
        <Link href="/events/new">
          <Button className="h-9 px-4 text-xs sm:text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all active:scale-95">
            <PlusIcon className="mr-2 h-4 w-4" weight="bold" />
            New Event
          </Button>
        </Link>
      }
    >
      <div className="space-y-6 sm:space-y-8">
        {/* Stats Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
          {statCards.map((stat, idx) => (
            <Card
              key={idx}
              className={`rounded-xl border-zinc-200/60 shadow-sm transition-all duration-500 starting:opacity-0 starting:translate-y-4 opacity-100 translate-y-0`}
              style={{ transitionDelay: `${idx * 50}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} weight="fill" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight text-zinc-900">
                  {loading ? (
                    <div className="h-8 w-16 bg-zinc-100 animate-pulse rounded-md mt-1" />
                  ) : (
                    stat.value
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-7">
          {/* Recent Events */}
          <Card className="md:col-span-4 rounded-xl border-zinc-200/60 shadow-sm transition-all duration-500 delay-200 starting:opacity-0 starting:translate-y-4 opacity-100 translate-y-0">
            <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <CardTitle className="text-base font-semibold">
                  Recent Events
                </CardTitle>
                <p className="text-sm text-zinc-500 mt-1">
                  Latest events added to the system
                </p>
              </div>
              <Link
                href="/events"
                className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 group"
              >
                View all
                <ArrowRightIcon className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-zinc-100">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4">
                      <div className="h-12 w-12 rounded-lg bg-zinc-100 animate-pulse shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-1/3 bg-zinc-100 animate-pulse rounded" />
                        <div className="h-3 w-1/4 bg-zinc-50 animate-pulse rounded" />
                      </div>
                    </div>
                  ))
                ) : events.length === 0 ? (
                  <div className="p-8 text-center text-sm text-zinc-500">
                    No events found.
                  </div>
                ) : (
                  events.slice(0, 4).map((event) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="flex items-center gap-4 p-4 hover:bg-zinc-50/80 transition-colors"
                    >
                      <div className="h-12 w-12 rounded-lg bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0 relative flex items-center justify-center">
                        {event.poster_path ? (
                          <img
                            src={`${CDN_URL}/${event.poster_path}`}
                            alt={event.event_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <CalendarIcon className="h-5 w-5 text-zinc-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-900 truncate">
                          {event.event_name}
                        </p>
                        <p className="text-xs text-zinc-500 truncate mt-0.5">
                          {formatDate(event.start_date_time)}
                        </p>
                      </div>
                      <div className="shrink-0 text-xs font-medium px-2 py-1 rounded-full bg-zinc-100 text-zinc-600">
                        {event.event_type}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="md:col-span-3 rounded-xl border-zinc-200/60 shadow-sm transition-all duration-500 delay-300 starting:opacity-0 starting:translate-y-4 opacity-100 translate-y-0">
            <CardHeader className="border-b border-zinc-100 pb-4">
              <CardTitle className="text-base font-semibold">
                Quick Actions
              </CardTitle>
              <p className="text-sm text-zinc-500 mt-1">
                Common tasks and shortcuts
              </p>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid gap-3">
                <Link href="/events/new">
                  <div className="flex items-center gap-4 p-3 rounded-lg border border-zinc-200 hover:border-primary/50 hover:bg-primary/5 transition-all group">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <PlusIcon className="h-5 w-5 text-primary" weight="bold" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900">
                        Create Event
                      </p>
                      <p className="text-xs text-zinc-500">
                        Add a new event manually
                      </p>
                    </div>
                  </div>
                </Link>
                <Link href="/events/import">
                  <div className="flex items-center gap-4 p-3 rounded-lg border border-zinc-200 hover:border-blue-500/50 hover:bg-blue-50 transition-all group">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <UsersIcon className="h-5 w-5 text-blue-600" weight="fill" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900">
                        Import Events
                      </p>
                      <p className="text-xs text-zinc-500">
                        Upload a CSV or Excel file
                      </p>
                    </div>
                  </div>
                </Link>
                <Link href="/upload">
                  <div className="flex items-center gap-4 p-3 rounded-lg border border-zinc-200 hover:border-purple-500/50 hover:bg-purple-50 transition-all group">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <ImageSquareIcon
                        className="h-5 w-5 text-purple-600"
                        weight="fill"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900">
                        Upload Media
                      </p>
                      <p className="text-xs text-zinc-500">
                        Add photos or videos to library
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CMSLayout>
  );
}
