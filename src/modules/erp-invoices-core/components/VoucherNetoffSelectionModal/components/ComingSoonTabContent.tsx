import { useTranslation } from "react-i18next";
import {
  Receipt,
  ReceiptText,
  Building2,
  BookCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils";

export interface ComingSoonFeature {
  icon: LucideIcon;
  title: string;
  desc: string;
  iconColor?: string;
  bgColor?: string;
}

export interface ComingSoonTabContentProps {
  title?: string;
  description?: string;
  badge?: string;
  className?: string;
  features?: ComingSoonFeature[];
  releaseNote?: string;
}

export function ComingSoonTabContent({
  title,
  description,
  badge,
  className,
  features,
  releaseNote,
}: ComingSoonTabContentProps) {
  const { t } = useTranslation(["erpInvoices", "common"]);

  const displayTitle = title || t("comingSoonCashBookTitle", "Sổ quỹ tiền mặt");
  const displayDesc =
    description ||
    t(
      "comingSoonCashBookDesc",
      "Tính năng đối soát & cấn trừ phiếu thu / chi sổ quỹ tiền mặt cho hóa đơn VAT đang được phát triển.",
    );
  const displayBadge = badge || t("comingSoonBadge", "Sắp ra mắt");

  const defaultFeatures: ComingSoonFeature[] = [
    {
      icon: ReceiptText,
      title: t("featureCashVouchers", "Phiếu Thu / Phiếu Chi"),
      desc: t(
        "featureCashVouchersDesc",
        "Tự động khớp số tiền, đối tác và số phiếu thu/chi nội bộ theo từng hóa đơn.",
      ),
      iconColor: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500/10 border-amber-200/60 dark:border-amber-800/60",
    },
    {
      icon: Building2,
      title: t("featureMultiBranchFunds", "Đa Quỹ Chi Nhánh"),
      desc: t(
        "featureMultiBranchFundsDesc",
        "Quản lý và đối soát nguồn tiền mặt chuẩn xác theo từng chi nhánh và điểm giao dịch.",
      ),
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10 border-blue-200/60 dark:border-blue-800/60",
    },
    {
      icon: BookCheck,
      title: t("featureRealtimePosting", "Hạch Toán TK 1111"),
      desc: t(
        "featureRealtimePostingDesc",
        "Tự động sinh bút toán Nợ/Có sổ cái và cấn trừ công nợ ngay khi xác nhận đối soát.",
      ),
      iconColor: "text-emerald-600 dark:text-emerald-400",
      bgColor:
        "bg-emerald-500/10 border-emerald-200/60 dark:border-emerald-800/60",
    },
  ];

  const activeFeatures = features || defaultFeatures;
  const displayReleaseNote =
    releaseNote ||
    t(
      "comingSoonReleaseNote",
      "Dự kiến phát hành trong bản cập nhật phân hệ Quản lý Tài chính Kế toán tiếp theo.",
    );

  return (
    <div
      className={cn(
        "relative w-full h-full flex-1 flex flex-col justify-between p-6 md:p-8 rounded-2xl border border-dashed border-slate-200/90 dark:border-slate-800 bg-gradient-to-b from-slate-50/70 via-slate-50/30 to-slate-100/50 dark:from-slate-900/50 dark:via-slate-900/20 dark:to-slate-950/50 overflow-hidden select-none",
        className,
      )}
    >
      {/* Background Dot Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-35 dark:opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Ambient decorative glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-400/10 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ─── 1. HERO SECTION ─── */}
      <div className="relative z-10 flex flex-col items-center text-center pt-2 md:pt-4">
        {/* Orbit Graphic with Clock & Receipt */}
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-full border border-slate-200/80 dark:border-slate-800 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs shadow-xs">
            <div className="w-12 h-12 rounded-full border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center animate-[spin_20s_linear_infinite]">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 absolute -top-1 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            </div>
            <Receipt className="w-6 h-6 text-slate-700 dark:text-slate-300 absolute" />
          </div>
        </div>

        {/* Badge */}
        <Badge
          variant="outline"
          className="mb-3 px-3.5 py-0.5 text-[11px] font-semibold rounded-full border-amber-300/80 dark:border-amber-700/80 bg-amber-50/80 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 tracking-wide uppercase shadow-2xs"
        >
          • {displayBadge} • CASHBOOK
        </Badge>

        {/* Title & Description */}
        <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-100 mb-1.5 tracking-tight">
          {displayTitle}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
          {displayDesc}
        </p>
      </div>

      {/* ─── 2. FEATURE PREVIEW HIGHLIGHTS ─── */}
      <div className="relative z-10 my-4 md:my-6 w-full max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {activeFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="flex flex-col items-start p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xs shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors text-left"
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 border",
                    feat.bgColor,
                  )}
                >
                  <Icon className={cn("w-4 h-4", feat.iconColor)} />
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  {feat.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 3. RELEASE FOOTER BANNER ─── */}
      <div className="relative z-10 flex items-center justify-center pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/80 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-400 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>{displayReleaseNote}</span>
        </div>
      </div>
    </div>
  );
}
