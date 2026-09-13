import React, { useState } from "react";
import { cn } from "@/shared/utils";
import { useT } from "@/core/i18n";
import {
  FileText,
  ShoppingCart,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  CreditCard,
  Layers,
  Eye,
  Copy,
  Check,
  Calendar,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";

export type DocTypeCategory =
  | "purchase"
  | "receipt"
  | "issue"
  | "invoice"
  | "payment"
  | "production"
  | "other";

export interface DrawerRelatedDocItem {
  id: string;
  docNo: string;
  docType: string;
  category?: DocTypeCategory;
  date?: string | Date;
  status?: string;
  statusVariant?: "default" | "secondary" | "outline" | "danger" | "warning";
  amount?: number | string;
  partnerName?: string;
  note?: string;
  onClick?: () => void;
}

export interface DrawerRelatedDocsProps {
  docs: DrawerRelatedDocItem[];
  emptyLabel?: string;
  onOpenDoc?: (doc: DrawerRelatedDocItem) => void;
  className?: string;
}

function getCategoryMeta(category?: DocTypeCategory, docType?: string) {
  const norm = (category || docType || "").toLowerCase();
  if (
    norm.includes("purchase") ||
    norm.includes("mua") ||
    norm.includes("po")
  ) {
    return {
      icon: <ShoppingCart className="w-3.5 h-3.5" />,
      colorCls: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    };
  }
  if (
    norm.includes("receipt") ||
    norm.includes("nhập") ||
    norm.includes("pnk")
  ) {
    return {
      icon: <ArrowDownLeft className="w-3.5 h-3.5" />,
      colorCls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    };
  }
  if (norm.includes("issue") || norm.includes("xuất") || norm.includes("pxk")) {
    return {
      icon: <ArrowUpRight className="w-3.5 h-3.5" />,
      colorCls: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    };
  }
  if (
    norm.includes("invoice") ||
    norm.includes("hóa đơn") ||
    norm.includes("vat")
  ) {
    return {
      icon: <Receipt className="w-3.5 h-3.5" />,
      colorCls: "bg-purple-500/10 text-purple-600 border-purple-500/30",
    };
  }
  if (
    norm.includes("payment") ||
    norm.includes("chi") ||
    norm.includes("thu") ||
    norm.includes("bank")
  ) {
    return {
      icon: <CreditCard className="w-3.5 h-3.5" />,
      colorCls: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30",
    };
  }
  if (
    norm.includes("production") ||
    norm.includes("sản xuất") ||
    norm.includes("mo")
  ) {
    return {
      icon: <Layers className="w-3.5 h-3.5" />,
      colorCls: "bg-teal-500/10 text-teal-600 border-teal-500/30",
    };
  }
  return {
    icon: <FileText className="w-3.5 h-3.5" />,
    colorCls: "bg-muted text-muted-foreground border-border",
  };
}

function formatAmount(amount?: number | string): string | null {
  if (amount === undefined || amount === null) return null;
  if (typeof amount === "number") {
    return amount.toLocaleString("vi-VN") + " ₫";
  }
  return String(amount);
}

function formatDate(date?: string | Date): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return String(date);
  return d.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function DrawerRelatedDocs({
  docs,
  emptyLabel,
  onOpenDoc,
  className,
}: DrawerRelatedDocsProps) {
  const t = useT();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, docNo: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(docNo);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  if (!docs || docs.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-muted-foreground flex flex-col items-center justify-center gap-1.5">
        <FileText className="w-5 h-5 text-muted-foreground/50 mb-1" />
        <span>{emptyLabel || t("Không có chứng từ liên quan.")}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3",
        className,
      )}
    >
      {docs.map((doc) => {
        const { icon, colorCls } = getCategoryMeta(doc.category, doc.docType);
        const isCopied = copiedId === doc.id;
        const formattedAmount = formatAmount(doc.amount);
        const formattedDate = formatDate(doc.date);

        return (
          <div
            key={doc.id}
            onClick={() => {
              if (doc.onClick) doc.onClick();
              else onOpenDoc?.(doc);
            }}
            className="group relative flex flex-col justify-between bg-surface border border-border/80 hover:border-primary/50 hover:shadow-sm rounded-xl p-3 cursor-pointer transition-all duration-200"
          >
            {/* Top row: Type Icon + Doc Type + Status Badge */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={cn(
                    "w-6 h-6 rounded-lg border flex items-center justify-center flex-shrink-0",
                    colorCls,
                  )}
                >
                  {icon}
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide truncate">
                  {doc.docType}
                </span>
              </div>

              {doc.status && (
                <span
                  className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded-md border whitespace-nowrap",
                    doc.statusVariant === "danger"
                      ? "bg-red-500/10 text-red-600 border-red-500/20"
                      : doc.statusVariant === "warning"
                        ? "bg-amber-500/10 text-amber-700 border-amber-500/20"
                        : "bg-muted text-muted-foreground border-border/70",
                  )}
                >
                  {doc.status}
                </span>
              )}
            </div>

            {/* Middle: Doc No & Partner */}
            <div className="mb-2">
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                <span className="truncate">{doc.docNo}</span>
                <button
                  type="button"
                  onClick={(e) => handleCopy(e, doc.docNo, doc.id)}
                  className="text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors"
                  title={isCopied ? t("Đã sao chép!") : t("Sao chép mã")}
                >
                  {isCopied ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>

              {doc.partnerName && (
                <div className="text-xs text-muted-foreground truncate mt-0.5">
                  {doc.partnerName}
                </div>
              )}
            </div>

            {/* Bottom: Date + Amount + Quick Action Button */}
            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs mt-auto">
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                {formattedDate && (
                  <>
                    <Calendar className="w-3 h-3 text-muted-foreground/60" />
                    <span>{formattedDate}</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                {formattedAmount && (
                  <span className="font-semibold text-foreground text-xs">
                    {formattedAmount}
                  </span>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="h-6 w-6 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors"
                  title={t("Xem chi tiết")}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (doc.onClick) doc.onClick();
                    else onOpenDoc?.(doc);
                  }}
                >
                  <Eye className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
