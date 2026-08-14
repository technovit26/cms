# TechnoVIT CMS

Content management system for TechnoVIT events and media. Manages events
(create/edit/import) and the media library, backed by the
[technovit-worker](https://github.com/technovit26/worker) API and served
assets from `cdn.puang.in`.

## Stack

- Next.js 16 (App Router) + React 19
- Tailwind CSS v4
- Clerk for authentication (admin-provisioned users only, no public sign-up)
- Radix UI primitives / shadcn-style components

## Getting started

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Copy `.env.local.example` (or create `.env.local`) with:

```
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_CDN_URL=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

`NEXT_PUBLIC_API_URL` points at the worker (defaults to
`http://127.0.0.1:8787` for local dev). `NEXT_PUBLIC_CDN_URL` points at the
public asset domain (defaults to `https://cdn.puang.in`). `NEXT_PUBLIC_SITE_URL`
should be set to the deployed CMS URL in production — it's used to resolve
absolute URLs for social share previews (Open Graph / Twitter cards).

## Scripts

- `bun dev` — start the dev server
- `bun run build` — production build
- `bun run lint` — eslint
