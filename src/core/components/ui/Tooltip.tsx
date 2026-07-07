import * as RadixTooltip from "@radix-ui/react-tooltip";

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return (
    <RadixTooltip.Provider delayDuration={200}>
      {children}
    </RadixTooltip.Provider>
  );
}

export function Tooltip({
  children,
  content,
  side = "right",
  disabled,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "right" | "left" | "top" | "bottom";
  disabled?: boolean;
}) {
  if (disabled || !content) return <>{children}</>;
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          sideOffset={10}
          className="tooltip-content"
        >
          {content}
          <RadixTooltip.Arrow className="tooltip-arrow" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}
