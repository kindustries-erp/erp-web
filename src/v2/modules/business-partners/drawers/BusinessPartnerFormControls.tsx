import type * as React from "react";
import { V2CopyButton } from "@/v2/shared/components/atoms";
import { Input } from "@/v2/shared/ui";

export const ReadValue = ({
  value,
  copy = false,
}: {
  value: string;
  copy?: boolean;
}) => (
  <div className="flex min-h-10 items-center justify-between rounded-lg border border-border/60 bg-surface-muted/50 px-3 py-2 text-sm">
    <span className="min-w-0 truncate">{value || "—"}</span>
    {copy && value && <V2CopyButton value={value} />}
  </div>
);

export const TextInput = ({
  viewing,
  value,
  onChange,
  ...props
}: {
  viewing: boolean;
  value: string;
  onChange: (value: string) => void;
} & Omit<React.ComponentProps<typeof Input>, "value" | "onChange">) =>
  viewing ? (
    <ReadValue
      value={value}
      copy={props.type === "email" || props.className?.includes("font-mono")}
    />
  ) : (
    <Input
      {...props}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
