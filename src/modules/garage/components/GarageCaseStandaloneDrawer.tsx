import React, { useState, useEffect } from "react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DrawerSection, DrawerRow } from "@/shared/components/DrawerModal";
import { useTranslation } from "react-i18next";
import { money, formatGMT7 } from "@/shared/utils/format";
import { useGarageStore } from "../store/garageStore";
import {
  useGarageCaseGrossProfit,
  useSyncGarageCaseDetail,
  useGarageCaseByCode,
} from "../hooks/useGarage";
import { GarageCasePreview } from "./GarageCasePreview";
import { KgaraCaseStatusBadge } from "./KgaraCaseStatusBadge";
import { GarageCaseSettlementSection } from "./GarageCaseSettlementSection";
import { DrawerDocumentTraceability } from "@/shared/components/drawer/DrawerDocumentTraceability";
import {
  GarageCaseSettlementDrawerModal,
  SettlementSubmissionItem,
} from "./GarageCaseSettlementDrawerModal";
import { InvoiceSelectionModal } from "./InvoiceSelectionModal";
import { garageApi } from "../api/garageApi";
import { Wallet, Link2, History, RefreshCw, Layers } from "lucide-react";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

interface GarageCaseStandaloneDrawerProps {
  isOpen: boolean;
  caseCode?: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function GarageCaseStandaloneDrawer({
  isOpen,
  caseCode,
  onClose,
}: GarageCaseStandaloneDrawerProps) {
  const { t } = useTranslation("garage");
  const queryClient = useQueryClient();
  const { selectedBranchId } = useGarageStore();

  const { data: selectedCase, isLoading: isLoadingCase } = useGarageCaseByCode(
    isOpen && caseCode ? caseCode : undefined,
  );

  const { mutate: syncCaseDetail, isPending: isSyncingDetail } =
    useSyncGarageCaseDetail();

  const [drawerMode, setDrawerMode] = useState<"view" | "edit">("view");
  const [showSettlementModal, setShowSettlementModal] =
    useState<boolean>(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);

  const { data: grossProfit } = useGarageCaseGrossProfit(caseCode || undefined);

  // Reset state when caseId changes or drawer opens
  useEffect(() => {
    if (isOpen) {
      setDrawerMode("view");
    }
  }, [isOpen, caseCode]);

  const refreshAllData = () => {
    if (selectedCase?.id) {
      queryClient.invalidateQueries({
        queryKey: ["garage-case-financial-summary", selectedCase.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["garage-case-settlements", selectedCase.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["garage-case-linked-invoices", selectedCase.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["garage-case-traceability-graph", selectedCase.id],
      });
    }
  };

  const resolvedRelatedTabs = selectedCase
    ? [
        // Tab 1: Trung tâm Trực quan hóa Mạng lưới Chứng từ (Visualization Hub)
        {
          key: "linked_docs",
          label: t("cases.drawer.linkedDocs", "Mạng lưới chứng từ"),
          icon: <Link2 className="w-3.5 h-3.5" />,
          content: (
            <DrawerDocumentTraceability
              rootId={selectedCase.id}
              rootType="GARAGE_CASE"
              fetchGraph={(id) => garageApi.getCaseTraceabilityGraph(id)}
              editMode={drawerMode === "edit"}
              allowedDocTypes={["PURCHASE_ORDER", "SALES_ORDER"]}
              onAddLink={(stageKey, docType) => {
                if (
                  docType === "PURCHASE_ORDER" ||
                  stageKey === "ORDER_STOCK"
                ) {
                  toast(
                    "Tính năng ghép nối Đơn mua hàng PO đang được cập nhật.",
                    { icon: "ℹ️" },
                  );
                } else {
                  toast(
                    "Vui lòng chuyển sang tab 'Dòng tiền & Hóa đơn đối soát' để liên kết Hóa đơn và Cấn trừ sao kê.",
                    { icon: "💡" },
                  );
                }
              }}
              onUnlinkNode={async (node) => {
                try {
                  if (node.docType === "INVOICE") {
                    const links = await garageApi.getCaseLinkedInvoices(
                      selectedCase.id,
                    );
                    const target = links.find(
                      (l: any) => l.invoiceId === node.id,
                    );
                    if (target) {
                      await garageApi.removeCaseLinkedInvoice(
                        selectedCase.id,
                        target.id,
                      );
                      toast.success("Đã hủy liên kết hóa đơn");
                    }
                  } else if (node.docType === "BANK_TXN") {
                    const settlements = await garageApi.getCaseSettlements(
                      selectedCase.id,
                    );
                    const target = settlements.find(
                      (s: any) =>
                        s.bank_transaction_id === node.id ||
                        `manual-${s.id}` === node.id,
                    );
                    if (target) {
                      await garageApi.removeCaseSettlement(
                        selectedCase.id,
                        target.id,
                      );
                      toast.success("Đã xóa giao dịch thanh toán");
                    }
                  }
                  refreshAllData();
                } catch (err: any) {
                  toast.error(
                    err?.response?.data?.message || "Lỗi khi hủy liên kết",
                  );
                }
              }}
            />
          ),
        },

        // Tab 2: Trung tâm Thao tác Nghiệp vụ Dòng tiền & Hóa đơn (Financial Operations Hub)
        {
          key: "cashflow_reconciliation",
          label: t(
            "cases.drawer.cashflowReconciliation",
            "Dòng tiền & Hóa đơn đối soát",
          ),
          icon: <Wallet className="w-3.5 h-3.5" />,
          content: (
            <GarageCaseSettlementSection
              caseId={selectedCase.id}
              caseCode={selectedCase.soChungTu}
              isCompleted={selectedCase.tinhTrangDichVu === 3}
              editMode={drawerMode === "edit"}
            />
          ),
        },

        // Tab 3: Lịch sử & Đồng bộ dữ liệu KGara
        {
          key: "sync_history",
          label: t("cases.drawer.syncHistory", "Lịch sử & Đồng bộ"),
          icon: <History className="w-3.5 h-3.5" />,
          content: (
            <div className="py-2 space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Thông tin Trạng thái & Đồng bộ từ Hệ thống KGara
                </span>
                <span className="text-slate-400">
                  Mã tham chiếu: {selectedCase.hdPhieuDichVuId || "---"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                  <span className="text-slate-500 text-[11px]">
                    Ngày phát sinh phiếu:
                  </span>
                  <div className="font-medium text-slate-800 dark:text-slate-200">
                    {selectedCase.ngayPhatSinh
                      ? formatGMT7(selectedCase.ngayPhatSinh, "date")
                      : "---"}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                  <span className="text-slate-500 text-[11px]">
                    Cập nhật lần cuối:
                  </span>
                  <div className="font-medium text-slate-800 dark:text-slate-200">
                    {selectedCase.updatedAt
                      ? formatGMT7(selectedCase.updatedAt, "datetime")
                      : "---"}
                  </div>
                </div>
              </div>
            </div>
          ),
        },
      ]
    : undefined;

  return (
    <>
      <StandardFormDrawer
        open={isOpen}
        mode={drawerMode}
        onToggleEdit={() =>
          setDrawerMode(drawerMode === "view" ? "edit" : "view")
        }
        onClose={onClose}
        title={`${t("cases.drawer.caseDetails", "Sổ báo giá:")} ${selectedCase?.soChungTu || ""}`}
        titleExtra={
          <KgaraCaseStatusBadge status={selectedCase?.tenTinhTrangDichVu} />
        }
        actions={
          drawerMode === "edit"
            ? [
                {
                  label: "Hủy",
                  variant: "outline" as const,
                  onClick: () => {
                    setDrawerMode("view");
                  },
                },
              ]
            : [
                {
                  label: t("cases.actions.syncDetails", "Đồng bộ chi tiết"),
                  onClick: () => {
                    if (selectedBranchId && selectedCase?.hdPhieuDichVuId) {
                      syncCaseDetail({
                        branchId: selectedBranchId,
                        caseId: selectedCase.hdPhieuDichVuId,
                      });
                    }
                  },
                  variant: "outline" as const,
                  loading: isSyncingDetail,
                  disabled:
                    isSyncingDetail ||
                    !selectedBranchId ||
                    !selectedCase?.hdPhieuDichVuId,
                },
              ]
        }
        leftPanel={
          isLoadingCase || isSyncingDetail ? (
            <div className="space-y-4 animate-pulse px-2 w-full">
              <div className="h-48 bg-slate-100 rounded-lg w-full"></div>
              <div className="h-64 bg-slate-100 rounded-lg w-full"></div>
            </div>
          ) : selectedCase ? (
            <div className="space-y-4">
              {drawerMode === "view" && (
                <GarageCasePreview
                  caseData={selectedCase}
                  grossProfit={grossProfit}
                />
              )}
            </div>
          ) : null
        }
        rightPanel={
          isLoadingCase || isSyncingDetail ? (
            <div className="space-y-4 animate-pulse px-2 w-full">
              <div className="h-20 bg-slate-100 rounded-lg w-full"></div>
              <div className="h-40 bg-slate-100 rounded-lg w-full"></div>
            </div>
          ) : selectedCase ? (
            <div className="space-y-4">
              {/* THÔNG TIN CHUNG */}
              <DrawerSection
                title={t("cases.drawer.generalInfo", "Thông tin chung")}
              >
                <DrawerRow
                  label={t("cases.drawer.caseCode", "Số chứng từ")}
                  value={selectedCase.soChungTu}
                />
                <DrawerRow
                  label={t("cases.drawer.plate", "Biển số xe")}
                  value={selectedCase.bienSoXe}
                />
                <DrawerRow
                  label={t("cases.drawer.customer", "Khách hàng")}
                  value={selectedCase.khachHangName}
                />
                <DrawerRow
                  label={t("cases.drawer.serviceStatus", "Trạng thái")}
                  value={selectedCase.tenTinhTrangDichVu}
                />
                <DrawerRow
                  label={t("cases.drawer.creationDate", "Ngày phát sinh")}
                  value={formatGMT7(selectedCase.ngayPhatSinh, "date")}
                />
              </DrawerSection>

              {/* TÀI CHÍNH BÁO GIÁ */}
              <DrawerSection
                title={t("cases.drawer.financials", "Tài chính báo giá")}
              >
                <DrawerRow
                  label={t("cases.drawer.totalAmount", "Tổng tiền")}
                  cls="font-semibold"
                  value={money(Number(selectedCase.tienCoThue || 0))}
                />
                <DrawerRow
                  label={t(
                    "cases.drawer.paidAmountCombined",
                    "Đã thanh toán (KH & BH)",
                  )}
                  cls="text-emerald-600 font-semibold"
                  value={money(
                    Number(selectedCase.khachHangDaThanhToan || 0) +
                      Number(selectedCase.baoHiemDaThanhToan || 0),
                  )}
                />
                <DrawerRow
                  label={t(
                    "cases.drawer.customerPaid",
                    "Khách hàng thanh toán",
                  )}
                  value={money(Number(selectedCase.khachHangDaThanhToan || 0))}
                />
                <DrawerRow
                  label={t("cases.drawer.insurancePaid", "Bảo hiểm thanh toán")}
                  value={money(Number(selectedCase.baoHiemDaThanhToan || 0))}
                />
                <DrawerRow
                  label={t("cases.drawer.remaining", "Còn phải thu")}
                  cls="text-rose-600 font-semibold"
                  value={money(Number(selectedCase.tienConPhaiThanhToan || 0))}
                />
              </DrawerSection>

              {/* LỢI NHUẬN GỘP & CHI PHÍ */}
              {grossProfit && (
                <DrawerSection
                  title={t(
                    "cases.drawer.grossProfitSection",
                    "Lợi nhuận gộp & Chi phí",
                  )}
                >
                  <DrawerRow
                    label={t("cases.drawer.revenue", "Doanh thu")}
                    value={money(
                      Number(
                        grossProfit.DoanhThu || selectedCase.doanhThu || 0,
                      ),
                    )}
                  />
                  <DrawerRow
                    label={t("cases.drawer.partCost", "Giá vốn phụ tùng")}
                    value={money(Number(grossProfit.GiaVonPhuTung || 0))}
                  />
                  <DrawerRow
                    label={t("cases.drawer.subcontractCost", "Gia công ngoài")}
                    value={money(Number(grossProfit.ChiPhiGiaCongNgoai || 0))}
                  />
                  {Number(grossProfit.ChiPhiHoaHongGDV || 0) > 0 && (
                    <DrawerRow
                      label={t(
                        "cases.drawer.commissionSurveyor",
                        "Hoa hồng Giám định viên",
                      )}
                      value={money(Number(grossProfit.ChiPhiHoaHongGDV || 0))}
                    />
                  )}
                  {Number(grossProfit.ChiPhiHoaHongMG || 0) > 0 && (
                    <DrawerRow
                      label={t(
                        "cases.drawer.commissionBroker",
                        "Hoa hồng Môi giới",
                      )}
                      value={money(Number(grossProfit.ChiPhiHoaHongMG || 0))}
                    />
                  )}
                  <DrawerRow
                    label={t("cases.drawer.grossProfit", "Lãi tạm tính")}
                    cls="text-emerald-600 font-bold"
                    value={money(
                      Number(
                        grossProfit.LoiNhuan || selectedCase.loiNhuan || 0,
                      ),
                    )}
                  />
                  {grossProfit.LoiNhuanCoThue != null && (
                    <DrawerRow
                      label={t(
                        "cases.drawer.grossProfitTax",
                        "Lãi tạm tính có thuế",
                      )}
                      cls="text-emerald-700 font-bold"
                      value={money(Number(grossProfit.LoiNhuanCoThue || 0))}
                    />
                  )}
                </DrawerSection>
              )}
            </div>
          ) : null
        }
        relatedTabs={resolvedRelatedTabs}
        defaultRelatedTabKey="linked_docs"
      />

      {/* MODALS CẤN TRỪ VÀ LIÊN KẾT HÓA ĐƠN */}
      {selectedCase && (
        <>
          <GarageCaseSettlementDrawerModal
            open={showSettlementModal}
            onClose={() => setShowSettlementModal(false)}
            caseId={selectedCase.id}
            caseCode={selectedCase.soChungTu}
            defaultType="RECEIPT"
            onSubmit={async (items) => {
              for (const item of items) {
                await garageApi.addCaseSettlement(selectedCase.id, item);
              }
              refreshAllData();
            }}
          />

          <InvoiceSelectionModal
            isOpen={showInvoiceModal}
            onClose={() => setShowInvoiceModal(false)}
            caseId={selectedCase.id}
            caseCode={selectedCase.soChungTu}
            defaultLinkType="OUT"
            onSuccess={refreshAllData}
            onSubmit={async (payload) => {
              await garageApi.addCaseLinkedInvoice(
                selectedCase.id,
                payload.invoiceId,
                payload.linkType,
                payload.note,
              );
            }}
          />
        </>
      )}
    </>
  );
}
