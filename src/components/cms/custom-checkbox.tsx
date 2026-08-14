import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}

export function CustomCheckbox({
  checked,
  onCheckedChange,
  className,
  ...props
}: CustomCheckboxProps) {
  return (
    <div
      className={cn(
        "relative flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md border-2 transition-all",
        checked
          ? "border-primary bg-primary"
          : "border-zinc-300 bg-white hover:border-primary/50",
        className
      )}
      onClick={() => onCheckedChange?.(!checked)}
    >
      <input
        type="checkbox"
        className="absolute h-full w-full opacity-0 cursor-pointer m-0 p-0"
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        {...props}
      />
      {checked && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
    </div>
  );
}
