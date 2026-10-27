import * as React from "react";

export interface V2AuthBrandBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const V2AuthBrandBadge: React.FC<V2AuthBrandBadgeProps> = ({
  className = "",
  size = "md",
}) => {
  const sizeClasses = {
    sm: "w-10 h-10 rounded-lg",
    md: "w-12 h-12 rounded-xl",
    lg: "w-16 h-16 rounded-2xl",
  }[size];

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }[size];

  return (
    <div
      data-testid="v2-auth-brand-badge"
      className={`flex items-center justify-center bg-primary text-primary-foreground shadow-sm ${sizeClasses} ${className}`}
    >
      <svg
        className={`${iconSizes} fill-current`}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z" />
      </svg>
    </div>
  );
};

V2AuthBrandBadge.displayName = "V2AuthBrandBadge";
