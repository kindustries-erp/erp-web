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
  // Shadow scales from size; keep proportional
  const shadowW = Math.round(size * 0.45);
  const shadowH = Math.round(size * 0.07);

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox="0 0 88 88"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="stroke-slate-400 dark:stroke-slate-500"
        style={{ animation: "emptyFloat 3.5s ease-in-out infinite" }}
      >
        <g strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
          {/* Inside of the box */}
          <path
            d="M44 32 L24 42 L44 52 L64 42 Z"
            className="fill-slate-200 dark:fill-slate-800"
          />

          {/* Left Face */}
          <path
            d="M24 42 L44 52 L44 70 L24 60 Z"
            className="fill-slate-100 dark:fill-slate-700/70"
          />

          {/* Right Face */}
          <path
            d="M44 52 L64 42 L64 60 L44 70 Z"
            className="fill-white dark:fill-slate-700"
          />

          {/* Left Flap */}
          <path
            d="M24 42 L16 34 L36 24 L44 32 Z"
            className="fill-white dark:fill-slate-600/80"
          />

          {/* Right Flap */}
          <path
            d="M64 42 L72 34 L52 24 L44 32 Z"
            className="fill-slate-100 dark:fill-slate-700/60"
          />
        </g>

        {/* Decoration lines on faces to look like a shipping box */}
        <line
          x1="24"
          y1="51"
          x2="44"
          y2="61"
          className="stroke-slate-300 dark:stroke-slate-600"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.6"
        />
        <line
          x1="64"
          y1="51"
          x2="44"
          y2="61"
          className="stroke-slate-300 dark:stroke-slate-600"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Subtle floating dots to indicate 'empty space' */}
        <circle
          cx="44"
          cy="40"
          r="1.5"
          className="fill-slate-400 dark:fill-slate-500"
          opacity="0.4"
        />
        <circle
          cx="36"
          cy="36"
          r="1.5"
          className="fill-slate-400 dark:fill-slate-500"
          opacity="0.3"
        />
        <circle
          cx="52"
          cy="44"
          r="1.5"
          className="fill-slate-400 dark:fill-slate-500"
          opacity="0.4"
        />
      </svg>

      {/* Ground shadow — separate element so it stays fixed while box floats */}
      <div
        className="bg-slate-400/25 dark:bg-black/50 blur-[3px]"
        style={{
          width: shadowW,
          height: shadowH,
          borderRadius: "50%",
          marginTop: -Math.round(size * 0.06),
          animation: "emptyShadow 3.5s ease-in-out infinite",
        }}
      />
    </div>
  );
}

function AnimatedIconWrapper({ icon }: { icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="flex items-center justify-center p-3 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs"
        style={{ animation: "emptyFloat 3.5s ease-in-out infinite" }}
      >
        {icon}
      </div>
      <div
        className="bg-slate-400/25 dark:bg-black/50 rounded-full blur-[3px]"
        style={{
          width: 36,
          height: 6,
          marginTop: 6,
          animation: "emptyShadow 3.5s ease-in-out infinite",
        }}
      />
    </div>
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
        {icon ? (
          <AnimatedIconWrapper icon={icon} />
        ) : (
          <DefaultIllustration size={svgSize} />
        )}
      </div>

      <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 text-center max-w-[240px] leading-relaxed">
        {message ?? "Không có dữ liệu"}
      </p>
      {description && (
        <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500 text-center max-w-[220px] leading-relaxed opacity-80">
          {description}
        </p>
      )}

      <style>{`
        @keyframes emptyFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes emptyShadow {
          0%, 100% { transform: scaleX(1);   opacity: 0.9; }
          50%       { transform: scaleX(0.5); opacity: 0.35; }
        }
      `}</style>
    </div>
  );
}
