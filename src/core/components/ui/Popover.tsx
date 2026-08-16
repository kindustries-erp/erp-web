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
          style={{
            background: "var(--popup-bg, rgba(246, 248, 252, 0.65))",
            backdropFilter: "blur(24px) saturate(200%)",
            WebkitBackdropFilter: "blur(24px) saturate(200%)",
          }}
          className={cn(
            "z-[9999] rounded-xl border border-[color:var(--popup-border)] shadow-[0_16px_40px_-8px_rgba(15,23,42,0.18),0_4px_12px_rgba(15,23,42,0.08),0_0_0_1px_rgba(255,255,255,0.6)_inset] data-[state=open]:animate-[popover-in_150ms_ease-out] data-[state=closed]:animate-[popover-out_100ms_ease-in]",
            glass &&
              "[--muted-fg:#374151] [--faint:#4b5563] [--foreground:#030712] [--popup-bg-hover:rgba(0,0,0,0.05)] text-[#1f2937] font-[450]",
            className,
          )}
        >
          {content}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}
