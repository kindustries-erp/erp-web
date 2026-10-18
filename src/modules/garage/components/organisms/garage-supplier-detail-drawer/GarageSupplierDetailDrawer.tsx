import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { TableText } from "@/shared/components/DataTable/TableText";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { Truck, Car, FileText, Loader2 } from "lucide-react";
import { garageApi } from "@/modules/garage/api/garageApi";
import type { GarageSupplierDetailDrawerProps } from "./GarageSupplierDetailDrawer.type";

export const GarageSupplierDetailDrawer: React.FC<
  GarageSupplierDetailDrawerProps
> = ({ open, onClose, supplierId, supplierCode, supplierName, branchId }) => {
  const { t } = useTranslation(["garage", "debts", "common"]);

  const { data, isLoading } = useQuery({
    queryKey: ["garage-supplier-cases", branchId, supplierId],
    queryFn: () => {
      if (!supplierId) return { payables: [], linkedCases: [] };
      return garageApi.getCasesBySupplier(branchId || "", supplierId);
    },
    enabled: Boolean(open && supplierId),
  });

  const payables = data?.payables || [];

  return (
    <StandardFormDrawer
      open={open}
      mode="view"
      onClose={onClose}
      title={supplierName || t("payables.drawer.title", "Chi tiết công nợ NCC")}
      subtitle={`${t("payables.columns.supplierCode", "Mã NCC")}: ${supplierCode || "—"}`}
      icon={<Truck className="w-5 h-5 text-primary" />}
      layout="1-column"
      size="lg"
      leftPanel={
        <div className="space-y-4 p-4 text-xs">
          <DrawerSection
            title={t(
              "payables.drawer.casesTitle",
              "1. DANH SÁCH VỤ VIỆC LIÊN QUAN",
            )}
          >
            {isLoading ? (
              <div className="flex items-center justify-center p-8 text-muted-foreground gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>{t("common:loading", "Đang tải dữ liệu...")}</span>
              </div>
            ) : payables.length === 0 ? (
              <div className="text-center p-6 text-muted-foreground bg-muted/20 rounded-md">
                {t(
                  "payables.drawer.emptyCases",
                  "Không có vụ việc phát sinh nợ",
                )}
              </div>
            ) : (
              <div className="border border-border/60 rounded-md overflow-hidden bg-background">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-muted/50 text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-2 text-center w-[40px]">#</th>
                      <th className="p-2">
                        {t("payables.drawer.colCase", "Mã vụ việc")}
                      </th>
                      <th className="p-2">
                        {t("payables.drawer.colPlate", "Biển số xe")}
                      </th>
                      <th className="p-2 text-right">
                        {t("payables.columns.totalPayable", "Phát sinh nợ")}
                      </th>
                      <th className="p-2 text-right">
                        {t("payables.columns.paidAmount", "Đã trả")}
                      </th>
                      <th className="p-2 text-right">
                        {t("payables.columns.remainingPayable", "Còn nợ")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {payables.map((item: any, idx: number) => {
                      const bal = Number(item.balance) || 0;
                      return (
                        <tr key={item.id || idx} className="hover:bg-muted/30">
                          <td className="p-2 text-center font-mono text-muted-foreground">
                            {idx + 1}
                          </td>
                          <td className="p-2 font-mono">
                            <div className="flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-primary" />
                              <TableText
                                text={item.maSoVuViec || "—"}
                                enableCopy={Boolean(item.maSoVuViec)}
                              />
                            </div>
                          </td>
                          <td className="p-2">
                            {item.linkedCase?.bienSoXe ? (
                              <div className="flex items-center gap-1 font-mono">
                                <Car className="w-3 h-3 text-muted-foreground" />
                                <span>{item.linkedCase.bienSoXe}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="p-2 text-right font-mono tabular-nums">
                            {money(Number(item.ckCo) || 0)}
                          </td>
                          <td className="p-2 text-right font-mono tabular-nums text-muted-foreground">
                            {money(Number(item.ckNo) || 0)}
                          </td>
                          <td
                            className={cn(
                              "p-2 text-right font-mono tabular-nums font-semibold",
                              bal > 0
                                ? "text-destructive"
                                : "text-emerald-600 dark:text-emerald-400",
                            )}
                          >
                            {money(bal)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </DrawerSection>
        </div>
      }
    />
  );
};
