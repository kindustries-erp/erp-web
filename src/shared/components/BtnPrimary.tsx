import type { ReactNode } from "react";
import { Button } from "@/shared/components/ui/Button";

interface BtnPrimaryProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}

/**
 * Primary action button – filled background with primary color.
 * Used consistently across all pages for create/confirm actions.
 *
 * @deprecated Prefer using <Button variant="primary"> directly.
 */
export function BtnPrimary({
  children,
  onClick,
  type = "button",
  disabled,
  className,
}: BtnPrimaryProps) {
  return (
    <Button
      variant="primary"
      size="sm"
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </Button>
  );
}
