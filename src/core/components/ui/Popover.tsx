import * as RadixPopover from "@radix-ui/react-popover";
import { cn } from "@/shared/utils";

interface PopoverProps {
  children: React.ReactNode;
  content: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  className?: string;
  glass?: boolean;
}

export function Popover({
  children,
  content,
  open,
  onOpenChange,
  side = "bottom",
  align = "end",
  sideOffset = 8,
  className,
  glass,
}: PopoverProps) {
  return (
    <RadixPopover.Root open={open} onOpenChange={onOpenChange}>
      <RadixPopover.Trigger asChild>{children}</RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          side={side}
          align={align}
          sideOffset={sideOffset}
          className={cn(
            "z-[9999] rounded-xl border shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] data-[state=open]:animate-[popover-in_150ms_ease-out] data-[state=closed]:animate-[popover-out_100ms_ease-in]",
            glass
              ? "backdrop-blur-xl bg-white/85 border-white/50 [--muted-fg:#374151] [--faint:#4b5563] [--foreground:#030712] [--popup-bg-hover:rgba(0,0,0,0.05)] text-[#1f2937] font-[450]"
              : "border-[color:var(--popup-border)] bg-[color:var(--popup-bg)]",
            className,
          )}
        >
          {content}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}
