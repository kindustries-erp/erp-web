import React from "react";
import { cn } from "@/shared/utils";

interface EmptyStateProps {
  message?: string;
  description?: string;
  className?: string;
  icon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { svg: 64, py: "py-6" },
  md: { svg: 88, py: "py-10" },
  lg: { svg: 108, py: "py-14" },
};

function DefaultIllustration({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 88 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ animation: "emptyFloat 3.5s ease-in-out infinite" }}
    >
      {/* Background circle */}
      <circle cx="44" cy="44" r="40" fill="#f8fafc" />
      <circle cx="44" cy="44" r="40" stroke="#f1f5f9" strokeWidth="1.5" />

      {/* Ground shadow */}
      <ellipse cx="44" cy="74" rx="20" ry="5" fill="#cbd5e1" opacity="0.3" />

      <g
        stroke="#94a3b8"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {/* Inside of the box */}
        <path d="M44 32 L24 42 L44 52 L64 42 Z" fill="#e2e8f0" />

        {/* Left Face */}
        <path d="M24 42 L44 52 L44 70 L24 60 Z" fill="#f1f5f9" />

        {/* Right Face */}
        <path d="M44 52 L64 42 L64 60 L44 70 Z" fill="#ffffff" />

        {/* Left Flap */}
        <path d="M24 42 L16 34 L36 24 L44 32 Z" fill="#ffffff" />

        {/* Right Flap */}
        <path d="M64 42 L72 34 L52 24 L44 32 Z" fill="#f1f5f9" />
      </g>

      {/* Decoration lines on faces to look like a shipping box */}
      <line
        x1="24"
        y1="51"
        x2="44"
        y2="61"
        stroke="#cbd5e1"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <line
        x1="64"
        y1="51"
        x2="44"
        y2="61"
        stroke="#cbd5e1"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Subtle floating dots to indicate 'empty space' */}
      <circle cx="44" cy="40" r="1.5" fill="#94a3b8" opacity="0.4" />
      <circle cx="36" cy="36" r="1.5" fill="#94a3b8" opacity="0.3" />
      <circle cx="52" cy="44" r="1.5" fill="#94a3b8" opacity="0.4" />
    </svg>
  );
}

export function EmptyState({
  message,
  description,
  className,
  icon,
  size = "md",
}: EmptyStateProps) {
  const { svg: svgSize, py } = sizeMap[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-4 select-none",
        py,
        className,
      )}
    >
      <div className="mb-4">
        {icon ?? <DefaultIllustration size={svgSize} />}
      </div>

      <p className="text-[13px] font-medium text-slate-400 text-center max-w-[220px] leading-relaxed">
        {message ?? "Không có dữ liệu"}
      </p>
      {description && (
        <p className="mt-1.5 text-[11px] text-slate-400 text-center max-w-[200px] leading-relaxed opacity-70">
          {description}
        </p>
      )}

      <style>{`
        @keyframes emptyFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
