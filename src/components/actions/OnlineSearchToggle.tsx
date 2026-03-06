import { cn } from "@/lib/utils.ts";
import { Globe } from "lucide-react";

export type OnlineSearchToggleProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
};

export function OnlineSearchToggle({
  checked,
  onCheckedChange,
  label,
}: OnlineSearchToggleProps) {
  return (
    <label className="relative flex-1 cursor-pointer group">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
      />

      <div
        className={cn(
          "relative flex items-center justify-center gap-2 h-9 px-4 py-2 w-full rounded-md border",
          "transition-all duration-300 ease-in-out",

          // unchecked
          "bg-background text-muted-foreground border-input",
          "hover:bg-accent/60 hover:text-accent-foreground hover:border-border hover:shadow-sm",

          // checked
          "peer-checked:bg-primary peer-checked:text-primary-foreground peer-checked:border-primary",
          "peer-checked:shadow-md peer-checked:-translate-y-0.5",

          // focus
          "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
        )}
      >
        <Globe
          className={cn(
            "h-4 w-4 shrink-0 transition-all duration-500",
            "group-hover:text-accent-foreground",
            checked && "rotate-180",
          )}
        />

        <span
          className={cn(
            "truncate select-none text-sm font-medium transition-colors duration-300",
            "text-inherit",
          )}
        >
          {label}
        </span>

        <div
          className={cn(
            "absolute bottom-1 left-1/2 h-0.5 -translate-x-1/2 rounded-full transition-all duration-300",
            "bg-primary-foreground/50",
            checked ? "w-4 opacity-100" : "w-0 opacity-0",
          )}
        />
      </div>
    </label>
  );
}
