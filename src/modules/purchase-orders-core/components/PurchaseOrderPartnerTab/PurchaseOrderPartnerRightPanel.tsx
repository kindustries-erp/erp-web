import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  User,
  ShoppingBag,
  FileText,
  Boxes,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { format, isValid } from "date-fns";
import { businessPartnersCoreApi } from "@/modules/business-partners-core/api/businessPartnersCoreApi";
import { purchaseOrdersCoreApi } from "../../api/purchaseOrdersCoreApi";
import { CopyButton } from "@/shared/components/CopyButton";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Badge } from "@/shared/components/ui/badge";
import { money } from "@/shared/utils/format";
import type { PurchaseOrderPartnerRightPanelProps } from "./types";

export const PurchaseOrderPartnerRightPanel = React.memo(
  function PurchaseOrderPartnerRightPanel({
    purchaseOrder,
    supplierId: propSupplierId,
  }: PurchaseOrderPartnerRightPanelProps) {
    const { t } = useTranslation("purchaseOrders");

    const effectiveSupplierId =
      propSupplierId ||
      (purchaseOrder as any)?.supplierId ||
      (purchaseOrder as any)?.supplier_id ||
      null;

    const { data: partnerData } = useQuery({
      queryKey: ["purchase-order-supplier-info", effectiveSupplierId],
      queryFn: () => businessPartnersCoreApi.get(effectiveSupplierId!),
      enabled: !!effectiveSupplierId,
      staleTime: 60_000,
    });

    const { data: statsData } = useQuery({
      queryKey: ["purchase-order-supplier-stats", effectiveSupplierId],
      queryFn: () =>
        purchaseOrdersCoreApi.getSupplierStats(effectiveSupplierId!),
      enabled: !!effectiveSupplierId,
      staleTime: 30_000,
    });

    const supplierName =
      partnerData?.name ||
      (purchaseOrder as any)?.supplierName ||
      (purchaseOrder as any)?.supplier_name_snapshot ||
      t("Chưa xác định");

    const taxCode = partnerData?.taxCode || "—";
    const phone = partnerData?.phone || "—";
    const email = partnerData?.email || "—";
    const address = partnerData?.address || "—";
    const contactName = partnerData?.contactName || "—";

    const totalOrders = statsData?.totalOrders ?? 0;
    const totalSpend = statsData?.totalSpend ?? 0;
    const totalReceived = statsData?.totalReceivedAmount ?? 0;
    const pendingAmount = statsData?.pendingAmount ?? 0;
    const completionRate = statsData?.completionRate ?? 0;
    const lastOrderDateStr = statsData?.lastOrderDate;
    const lastOrderFormatted =
      lastOrderDateStr && isValid(new Date(lastOrderDateStr))
        ? format(new Date(lastOrderDateStr), "dd/MM/yyyy")
        : "—";

    return (
      <div className="space-y-4 text-xs">
        {/* Section 1: Thông tin Nhà cung cấp */}
        <DrawerSection title={t("Thông tin Nhà cung cấp")}>
          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 border border-blue-100 dark:border-blue-900/50">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-foreground text-sm leading-snug break-words">
                  {supplierName}
                </div>
                {partnerData?.code && (
                  <Badge
                    variant="outline"
                    className="mt-1 text-[10px] font-mono px-1.5 py-0"
                  >
                    {partnerData.code}
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/50 text-[11.5px]">
              {taxCode !== "—" && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">
                    {t("Mã số thuế")}:
                  </span>
                  <div className="flex items-center gap-1 font-mono font-medium text-foreground">
                    <span>{taxCode}</span>
                    <CopyButton value={taxCode} className="h-4 w-4" />
                  </div>
                </div>
              )}

              {phone !== "—" && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {t("Điện thoại")}:
                  </span>
                  <span className="font-medium text-foreground">{phone}</span>
                </div>
              )}

              {email !== "—" && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {t("Email")}:
                  </span>
                  <span
                    className="font-medium text-foreground truncate max-w-[160px]"
                    title={email}
                  >
                    {email}
                  </span>
                </div>
              )}

              {contactName !== "—" && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <User className="w-3 h-3" /> {t("Người liên hệ")}:
                  </span>
                  <span className="font-medium text-foreground">
                    {contactName}
                  </span>
                </div>
              )}

              {address !== "—" && (
                <div className="pt-1">
                  <span className="text-muted-foreground flex items-center gap-1 mb-0.5">
                    <MapPin className="w-3 h-3" /> {t("Địa chỉ")}:
                  </span>
                  <p className="text-foreground leading-relaxed text-[11px] bg-muted/40 p-2 rounded-md border border-border/40">
                    {address}
                  </p>
                </div>
              )}
            </div>
          </div>
        </DrawerSection>

        {/* Section 2: Tổng quan & Chỉ số Mua hàng */}
        <DrawerSection title={t("Tổng quan & Chỉ số Mua hàng")}>
          <div className="space-y-3 pt-1">
            {/* 4 Thẻ KPI Metrics */}
            <div className="grid grid-cols-2 gap-2">
              {/* Card 1: Tổng chi tiêu */}
              <div className="p-2.5 bg-blue-50/60 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/40 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-blue-900 dark:text-blue-300 font-medium">
                  <span>{t("Tổng chi tiêu")}</span>
                  <ShoppingBag className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="font-mono font-bold text-xs text-blue-700 dark:text-blue-300 mt-1 truncate">
                  {money(totalSpend)}
                </div>
              </div>

              {/* Card 2: Tổng đơn đặt */}
              <div className="p-2.5 bg-indigo-50/60 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/40 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-indigo-900 dark:text-indigo-300 font-medium">
                  <span>{t("Tổng đơn đặt")}</span>
                  <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="font-mono font-bold text-xs text-indigo-700 dark:text-indigo-300 mt-1">
                  {totalOrders}{" "}
                  <span className="text-[10px] font-normal text-muted-foreground">
                    {t("đơn")}
                  </span>
                </div>
              </div>

              {/* Card 3: Đã nhận hàng */}
              <div className="p-2.5 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/40 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-emerald-900 dark:text-emerald-300 font-medium">
                  <span>{t("Đã nhận")}</span>
                  <Boxes className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-300 mt-1 truncate">
                  {money(totalReceived)}
                </div>
              </div>

              {/* Card 4: Tỷ lệ hoàn tất */}
              <div className="p-2.5 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/40 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-amber-900 dark:text-amber-300 font-medium">
                  <span>{t("Hoàn tất")}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="font-mono font-bold text-xs text-amber-700 dark:text-amber-300 mt-1">
                  {completionRate}%
                </div>
              </div>
            </div>

            {/* Tiến độ nhận hàng */}
            <div className="p-3 bg-surface/60 rounded-xl border border-border/70 space-y-2">
              <div className="flex items-center justify-between text-[11.5px]">
                <span className="font-medium text-foreground flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  {t("Tiến độ giao nhận")}:
                </span>
                <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {completionRate}%
                </span>
              </div>
              <div className="w-full bg-muted/80 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.max(0, completionRate))}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[10.5px] text-muted-foreground pt-1">
                <span>
                  {t("Đã nhận")}: {money(totalReceived)}
                </span>
                <span>
                  {t("Còn lại")}: {money(pendingAmount)}
                </span>
              </div>
            </div>

            {/* Lần đặt gần nhất */}
            <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg border border-border/50 text-[11px]">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                {t("Đơn gần nhất")}:
              </span>
              <span className="font-medium font-mono text-foreground">
                {lastOrderFormatted}
              </span>
            </div>
          </div>
        </DrawerSection>
      </div>
    );
  },
);
