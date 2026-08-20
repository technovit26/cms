"use client";

import { useUser } from "@clerk/nextjs";

// Header values must be Latin-1; names/emails may contain characters outside
// that range, so encode them and have the worker decode on the way in.
export function useActorHeaders(): Record<string, string> {
  const { user } = useUser();
  if (!user) return {};

  const headers: Record<string, string> = { "X-User-Id": user.id };

  const name = user.fullName || user.username;
  if (name) headers["X-User-Name"] = encodeURIComponent(name);

  const email = user.primaryEmailAddress?.emailAddress;
  if (email) headers["X-User-Email"] = encodeURIComponent(email);

  return headers;
}
