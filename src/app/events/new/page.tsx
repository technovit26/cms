"use client";

import { CMSLayout } from "@/components/cms/cms-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { EventForm } from "@/components/cms/event-form";

export default function NewEventPage() {
  return (
    <CMSLayout
      title="Create Event"
      description="Add a new event to your TechnoVIT calendar"
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
        <Card className="max-w-3xl rounded-xl border-zinc-200/60 bg-white shadow-sm h-fit">
          <CardHeader className="border-b border-zinc-100/80 p-5 sm:px-6">
            <CardTitle className="text-lg font-semibold tracking-tight text-zinc-900">
              Event Details
            </CardTitle>
            <p className="text-sm text-zinc-500 mt-1">
              Fill in the information below to create a new TechnoVIT event.
            </p>
          </CardHeader>
          <CardContent className="p-5 sm:p-6">
            <EventForm />
          </CardContent>
        </Card>
      </div>
    </CMSLayout>
  );
}
