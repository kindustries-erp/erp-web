import { useTranslation } from "react-i18next";
import { Clock } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";

interface ComingSoonTabContentProps {
  title?: string;
  description?: string;
  badge?: string;
}

export function ComingSoonTabContent({
  title,
  description,
  badge,
}: ComingSoonTabContentProps) {
  const { t } = useTranslation(["erpInvoices", "common"]);

  const displayTitle = title || t("comingSoonCashBookTitle", "Sổ quỹ tiền mặt");
  const displayDesc =
    description ||
    t(
      "comingSoonCashBookDesc",
      "Tính năng đối soát sổ quỹ tiền mặt đang được phát triển.",
    );
  const displayBadge = badge || t("comingSoonBadge", "Sắp ra mắt");

  return (
    <div className="relative flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 overflow-hidden select-none">
      {/* Background Dot Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Orbit Graphic with Clock */}
      <div className="relative mb-6 z-10">
        <div className="w-20 h-20 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs shadow-2xs">
          <div className="w-14 h-14 rounded-full border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center animate-[spin_20s_linear_infinite]">
            <div className="w-2 h-2 rounded-full bg-amber-500 absolute -top-1" />
          </div>
          <Clock className="w-6 h-6 text-slate-700 dark:text-slate-300 absolute" />
        </div>
      </div>

      {/* Badge */}
      <Badge
        variant="outline"
        className="mb-3.5 px-3 py-0.5 text-xs font-semibold rounded-full border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 tracking-wide uppercase shadow-2xs z-10"
      >
        • {displayBadge}
      </Badge>

      {/* Title & Description */}
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1.5 z-10">
        {displayTitle}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed z-10">
        {displayDesc}
      </p>
    </div>
  );
}
