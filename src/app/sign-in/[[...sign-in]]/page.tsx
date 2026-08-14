"use client";

import { SignIn } from "@clerk/nextjs";
import { GithubLogoIcon, HeartIcon } from "@phosphor-icons/react";

export default function Page() {
  return (
    <div className="flex flex-col items-center min-h-screen justify-center bg-zinc-50">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="mb-8 flex items-center justify-center gap-3">
          <span className="font-bold text-2xl text-foreground tracking-tight">
            TechnoVIT
          </span>
        </div>
        <SignIn />
      </div>

      <div className="pb-8 flex items-center gap-3 text-xs text-zinc-400 font-medium">
        <span className="flex items-center gap-1.5">
          <span>Made with</span>
          <HeartIcon
            weight="fill"
            className="h-3.5 w-3.5 text-red-500 animate-pulse"
          />
          <span>by TechnoVIT Website Team</span>
        </span>
        <a
          href="https://github.com/technovit26/cms"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <GithubLogoIcon className="h-3.5 w-3.5" />
          <span>Open Source</span>
        </a>
      </div>
    </div>
  );
}
