import type { ReactNode } from "react";

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
 */
export function BtnPrimary({ children, onClick, type = "button", disabled, className }: BtnPrimaryProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-[14px] py-[7px] rounded-lg border border-primary bg-primary text-primary-fg text-xs font-medium cursor-pointer flex items-center gap-[6px] hover:opacity-90 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${className ?? ""}`}
    >
      {children}
    </button>
  );
}
