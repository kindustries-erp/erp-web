import React, { useState, useMemo, useEffect } from "react";
import { format, isValid, parseISO } from "date-fns";
import { FileSpreadsheet, Download, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";

import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { Combobox } from "@/shared/components/Combobox";
import { DatePicker } from "@/shared/components/DatePicker";
import { Button } from "@/shared/components/ui/Button";
import { useT } from "@/core/i18n";
import {
  PERIOD_OPTS,
  periodFirstDay,
  periodLastDay,
  periodFromExactRange,
  initPeriod,
} from "@/modules/finance/utils/financeHelpers";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";

interface BankStatementExportDrawerProps {
  open: boolean;
  onClose: () => void;
  type: "bank" | "cash";
  branches: Array<{ id: string; name: string }>;
  accountsData: any[];
}

function toDisplayDate(iso?: string) {
  if (!iso) return "-";
  const date = parseISO(iso);
  if (!isValid(date)) return "-";
  return format(date, "dd/MM/yyyy HH:mm");
}

export function BankStatementExportDrawer({
  open,
  onClose,
  type,
  branches,
  accountsData,
}: BankStatementExportDrawerProps) {
  const t = useT();

  const [period, setPeriod] = useState(initPeriod());
  const [dateFrom, setDateFrom] = useState(periodFirstDay(period));
  const [dateTo, setDateTo] = useState(periodLastDay(period));
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [transactionType, setTransactionType] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);

  const periodOptions = useMemo(
    () => [
      ...PERIOD_OPTS,
      {
        value: "custom",
        label: t("bankStatement.exportCustomRange", "Tùy chỉnh khoảng ngày"),
      },
    ],
    [t],
  );

  const handlePeriodChange = (next?: string) => {
    const value = next || "";
    if (!value || value === "custom") {
      setPeriod("");
      return;
    }

    setPeriod(value);
    if (value && value !== "custom") {
      setDateFrom(periodFirstDay(value));
      setDateTo(periodLastDay(value));
    }
  };

  useEffect(() => {
    const nextPeriod = periodFromExactRange(dateFrom, dateTo);
    setPeriod((prev) => (prev === nextPeriod ? prev : nextPeriod));
  }, [dateFrom, dateTo]);

  const branchOptions = useMemo(
    () => [
      { value: "", label: t("common.allBranches", "Tất cả chi nhánh") },
      ...branches.map((b) => ({ value: b.id, label: b.name })),
    ],
    [branches, t],
  );

  const accountOptions = useMemo(() => {
    const defaultLabel =
      type === "bank"
        ? t("bankStatement.allBankAccounts", "Tất cả tài khoản ngân hàng")
        : t("bankStatement.allCashBooks", "Tất cả sổ quỹ");

    return [
      { value: "", label: defaultLabel },
      ...accountsData.map((a: any) => ({
        value: a.id,
        label:
          type === "bank"
            ? `${a.bankCode} - ${a.accountNumber} (${a.accountName || ""})`
            : a.name,
      })),
    ];
  }, [accountsData, type, t]);

  const transactionTypeOptions = useMemo(
    () => [
      {
        value: "",
        label: t("bankStatement.allTypes", "Tất cả loại giao dịch"),
      },
      { value: "IN", label: t("bankStatement.typeIn", "Tiền vào (Thu)") },
      { value: "OUT", label: t("bankStatement.typeOut", "Tiền ra (Chi)") },
    ],
    [t],
  );

  const handleExport = async () => {
    if (!dateFrom || !dateTo) {
      toast.error(
        t(
          "bankStatement.missingDateRange",
          "Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.",
        ),
      );
      return;
    }

    try {
      setIsExporting(true);

      const params: any = {
        page: 1,
        pageSize: 10000,
        sourceType: type === "bank" ? "BANK" : "CASH",
        startDate: `${dateFrom} 00:00:00`,
        endDate: `${dateTo} 23:59:59`,
      };

      if (selectedBranchId) params.branchId = selectedBranchId;
      if (selectedAccountId) {
        if (type === "bank") params.bankAccountId = selectedAccountId;
        else params.cashBookId = selectedAccountId;
      }
      if (transactionType) params.transactionType = transactionType;

      const response = await bankStatementApi.getTransactions(params);
      const items: any[] = response?.items || [];

      if (items.length === 0) {
        toast.error(
          t(
            "bankStatement.noDataToExport",
            "Không có giao dịch nào trong khoảng thời gian đã chọn.",
          ),
        );
        return;
      }

      // Prepare Excel rows
      const rows: any[][] = [];

      // Header row
      rows.push([
        "STT",
        type === "bank" ? "Ngân hàng" : "Sổ quỹ",
        "Ngày GD",
        "Số tham chiếu",
        "Diễn giải",
        "Thu (VND)",
        "Chi (VND)",
        "Số dư (VND)",
        "Đã cấn trừ (VND)",
        "Còn lại (VND)",
        "TK đối ứng",
        "Tên đối tác",
        "Ngân hàng đối tác",
        "Chi nhánh",
      ]);

      let totalCredit = 0;
      let totalDebit = 0;
      let totalNetOff = 0;
      let totalRemaining = 0;

      items.forEach((item, index) => {
        const credit = parseFloat(item.creditAmount) || 0;
        const debit = parseFloat(item.debitAmount) || 0;
        const netOff = parseFloat(item.netOffAmount) || 0;
        const remaining = Math.max(credit, debit) - netOff;

        totalCredit += credit;
        totalDebit += debit;
        totalNetOff += netOff;
        totalRemaining += Math.max(0, remaining);

        const accountText =
          type === "bank"
            ? item.bankAccount
              ? `${item.bankAccount.bankCode} - ${item.bankAccount.accountNumber}`
              : ""
            : item.cashBook?.name || "";

        rows.push([
          index + 1,
          accountText,
          toDisplayDate(item.transDate),
          item.referenceNumber || "",
          item.description || "",
          credit || 0,
          debit || 0,
          parseFloat(item.balance) || 0,
          netOff || 0,
          remaining || 0,
          item.correspondentAccount || "",
          item.correspondentName || "",
          item.correspondentBank || "",
          item.branch?.name || "",
        ]);
      });

      // Total summary row
      rows.push([
        "TỔNG CỘNG",
        "",
        "",
        "",
        `Tổng ${items.length} giao dịch`,
        totalCredit,
        totalDebit,
        "",
        totalNetOff,
        totalRemaining,
        "",
        "",
        "",
        "",
      ]);

      // Create sheet and workbook
      const ws = XLSX.utils.aoa_to_sheet(rows);

      // Set optimal column widths
      ws["!cols"] = [
        { wch: 6 }, // STT
        { wch: 22 }, // Tai khoan / So quy
        { wch: 18 }, // Ngay GD
        { wch: 22 }, // So tham chieu
        { wch: 45 }, // Dien giai
        { wch: 16 }, // Thu
        { wch: 16 }, // Chi
        { wch: 16 }, // So du
        { wch: 16 }, // Da can tru
        { wch: 16 }, // Con lai
        { wch: 18 }, // TK doi ung
        { wch: 28 }, // Ten doi tac
        { wch: 20 }, // Ngan hang doi tac
        { wch: 20 }, // Chi nhanh
      ];

      const wb = XLSX.utils.book_new();
      const sheetName =
        type === "bank" ? "Sao ke Ngan hang" : "So quy Tien mat";
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      // Format file name
      const prefix = type === "bank" ? "Sao_ke_ngan_hang" : "So_quy_tien_mat";
      const fromStr = dateFrom.replace(/-/g, "");
      const toStr = dateTo.replace(/-/g, "");
      const fileName = `${prefix}_${fromStr}_${toStr}.xlsx`;

      XLSX.writeFile(wb, fileName);
      toast.success(
        t(
          "bankStatement.exportSuccess",
          `Xuất thành công ${items.length} giao dịch ra file Excel!`,
        ),
      );
      onClose();
    } catch (error: any) {
      toast.error(
        error?.message ||
          t("bankStatement.exportFailed", "Xuất file Excel thất bại."),
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <StandardFormDrawer
      open={open}
      mode="view"
      onClose={onClose}
      title={
        type === "bank"
          ? t("bankStatement.exportBankTitle", "Xuất Excel sao kê ngân hàng")
          : t("bankStatement.exportCashTitle", "Xuất Excel sổ quỹ tiền mặt")
      }
      subtitle={t(
        "bankStatement.exportSubtitle",
        "Chọn kỳ, khoảng ngày và các điều kiện lọc để xuất file Excel chi tiết",
      )}
      icon={<FileSpreadsheet className="w-4 h-4" />}
      layout="1-column"
      size="lg"
      leftPanel={
        <div className="space-y-5">
          <div className="p-4 bg-muted/40 rounded-xl border border-border/80 space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("bankStatement.timeFilter", "Khoảng thời gian")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  {t("bankStatement.period", "Kỳ")}
                </label>
                <Combobox
                  options={periodOptions}
                  value={period}
                  onChange={(v) => handlePeriodChange(v ?? "")}
                  placeholder={t("bankStatement.selectPeriod", "Chọn kỳ...")}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  {t("bankStatement.dateFrom", "Từ ngày")}
                </label>
                <DatePicker
                  value={dateFrom}
                  onChange={(v) => setDateFrom(v)}
                  placeholder="dd/mm/yyyy"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  {t("bankStatement.dateTo", "Đến ngày")}
                </label>
                <DatePicker
                  value={dateTo}
                  onChange={(v) => setDateTo(v)}
                  placeholder="dd/mm/yyyy"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/40 rounded-xl border border-border/80 space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("bankStatement.scopeFilter", "Phạm vi & Đối tượng")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  {t("bankStatement.branch", "Chi nhánh")}
                </label>
                <Combobox
                  options={branchOptions}
                  value={selectedBranchId}
                  onChange={(v) => setSelectedBranchId(v ?? "")}
                  placeholder={t(
                    "bankStatement.allBranches",
                    "Tất cả chi nhánh",
                  )}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  {type === "bank"
                    ? t("bankStatement.bankAccount", "Tài khoản ngân hàng")
                    : t("bankStatement.cashBook", "Sổ quỹ")}
                </label>
                <Combobox
                  options={accountOptions}
                  value={selectedAccountId}
                  onChange={(v) => setSelectedAccountId(v ?? "")}
                  placeholder={
                    type === "bank"
                      ? t("bankStatement.allBankAccounts", "Tất cả ngân hàng")
                      : t("bankStatement.allCashBooks", "Tất cả sổ quỹ")
                  }
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  {t("bankStatement.transactionType", "Loại giao dịch")}
                </label>
                <Combobox
                  options={transactionTypeOptions}
                  value={transactionType}
                  onChange={(v) => setTransactionType(v ?? "")}
                  placeholder={t("bankStatement.allTypes", "Tất cả")}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose} disabled={isExporting}>
              {t("common.cancel", "Hủy bỏ")}
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="gap-2"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isExporting
                ? t("bankStatement.exporting", "Đang xuất file...")
                : t("bankStatement.exportNow", "Xuất file Excel (.xlsx)")}
            </Button>
          </div>
        </div>
      }
    />
  );
}
