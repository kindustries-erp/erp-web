import React, { useMemo, useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { type DrawerAction } from "@/shared/components/DrawerModal";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { Combobox } from "@/shared/components/Combobox";
import { SearchInput } from "@/shared/components/SearchInput";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/input";
import { DatePicker } from "@/shared/components/DatePicker";
import { Settings2, Plus, Trash2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { accountingApi } from "@/modules/accounting/api/accountingApi";
import { erpInvoicesCoreApi, type ErpInvoice } from "../api/erpInvoicesCoreApi";
import { money } from "@/shared/utils/format";

interface Props {
  open: boolean;
  onClose: () => void;
  selectedInvoiceIds: string[];
  invoices: ErpInvoice[];
  direction?: "IN" | "OUT";
  mode?: "post" | "unpost";
  onSuccess: () => void;
}

interface PostInvoiceLine {
  id: string;
  accountId: string;
  debit: number;
  credit: number;
  description: string;
}

type CustomConfig = {
  description: string;
  lines: PostInvoiceLine[];
};

// Component helper để format số tiền
function NumberInput({ value, onChange, ...props }: any) {
  const [isFocused, setIsFocused] = useState(false);
  const [display, setDisplay] = useState(
    value ? money(value).replace(/\s?đ$/, "") : "0",
  );

  useEffect(() => {
    if (!isFocused) {
      setDisplay(value ? money(value).replace(/\s?đ$/, "") : "0");
    }
  }, [value, isFocused]);

  const handleBlur = (e: any) => {
    setIsFocused(false);
    setDisplay(value ? money(value).replace(/\s?đ$/, "") : "0");
    if (props.onBlur) props.onBlur(e);
  };

  const handleFocus = (e: any) => {
    setIsFocused(true);
    setDisplay(value ? value.toString() : "");
    if (props.onFocus) props.onFocus(e);
  };

  const handleChange = (e: any) => {
    const val = e.target.value;
    const raw = val.replace(/[^0-9-]/g, "");
    setDisplay(raw);
    onChange(Number(raw) || 0);
  };

  return (
    <Input
      type="text"
      value={display}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      className="text-right"
      {...props}
    />
  );
}

export function InvoiceBulkPostingDrawer({
  open,
  onClose,
  selectedInvoiceIds,
  invoices,
  direction = "IN",
  mode = "post",
  onSuccess,
}: Props) {
  const selectedInvoices = useMemo(() => {
    return invoices.filter(
      (inv) =>
        selectedInvoiceIds.includes(inv.id) &&
        (mode === "unpost"
          ? inv.postingStatus === "POSTED"
          : inv.postingStatus !== "POSTED"),
    );
  }, [invoices, selectedInvoiceIds, mode]);

  const skippedInvoices = useMemo(() => {
    return invoices.filter(
      (inv) =>
        selectedInvoiceIds.includes(inv.id) &&
        (mode === "unpost"
          ? inv.postingStatus !== "POSTED"
          : inv.postingStatus === "POSTED"),
    );
  }, [invoices, selectedInvoiceIds, mode]);

  const branchId =
    selectedInvoices.length > 0 ? selectedInvoices[0].branchId : null;

  const { data: chartOfAccounts } = useQuery({
    queryKey: ["chart-of-accounts", branchId],
    queryFn: () => accountingApi.getChartOfAccounts({ branchId }),
    enabled: !!branchId && open,
  });

  const accountOptions = useMemo(() => {
    const list = Array.isArray(chartOfAccounts)
      ? chartOfAccounts
      : chartOfAccounts?.items || [];
    return list.map((a: any) => ({
      value: a.id,
      label: `${a.accountCode} - ${a.accountName}`,
    }));
  }, [chartOfAccounts]);

  const [globalDate, setGlobalDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );

  // Global settings for IN
  const [globalInCost, setGlobalInCost] = useState<string>("");
  const [globalInVat, setGlobalInVat] = useState<string>("");
  const [globalInAp, setGlobalInAp] = useState<string>("");

  // Global settings for OUT
  const [globalOutAr, setGlobalOutAr] = useState<string>("");
  const [globalOutRev, setGlobalOutRev] = useState<string>("");
  const [globalOutVat, setGlobalOutVat] = useState<string>("");

  const [customConfigs, setCustomConfigs] = useState<
    Record<string, CustomConfig>
  >({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  // Auto-fill defaults
  useEffect(() => {
    if (!accountOptions.length) return;
    const findAccount = (prefix: string) =>
      accountOptions.find((a: any) =>
        a.label.split(" - ")[0]?.startsWith(prefix),
      )?.value || "";

    if (direction === "IN") {
      setGlobalInCost(
        findAccount("642") || findAccount("152") || findAccount("156"),
      );
      setGlobalInVat(findAccount("133"));
      setGlobalInAp(findAccount("331"));
    } else {
      setGlobalOutAr(findAccount("131"));
      setGlobalOutRev(findAccount("511"));
      setGlobalOutVat(findAccount("333"));
    }
  }, [accountOptions, direction]);

  useEffect(() => {
    if (open) {
      setGlobalDate(new Date().toISOString().slice(0, 10));
      setCustomConfigs({});
      setExpandedId(null);
      setSearchTerm("");
      setIsDirty(false);
    }
  }, [open, selectedInvoiceIds]);

  const getDefaultConfig = (inv: ErpInvoice): CustomConfig => {
    const preVat = Number(inv.preVatAmount) || 0;
    const vat = Number(inv.vatAmount) || 0;
    const total = Number(inv.totalAmount) || 0;
    const baseDesc = inv.description || `Hạch toán hóa đơn ${inv.invoiceNo}`;

    const lines: PostInvoiceLine[] = [];

    if (direction === "IN") {
      if (preVat > 0)
        lines.push({
          id: crypto.randomUUID(),
          accountId: globalInCost,
          debit: preVat,
          credit: 0,
          description: baseDesc,
        });
      if (vat > 0)
        lines.push({
          id: crypto.randomUUID(),
          accountId: globalInVat,
          debit: vat,
          credit: 0,
          description: `Thuế GTGT ${inv.invoiceNo}`,
        });
      if (total > 0)
        lines.push({
          id: crypto.randomUUID(),
          accountId: globalInAp,
          debit: 0,
          credit: total,
          description: baseDesc,
        });
    } else {
      if (total > 0)
        lines.push({
          id: crypto.randomUUID(),
          accountId: globalOutAr,
          debit: total,
          credit: 0,
          description: baseDesc,
        });
      if (preVat > 0)
        lines.push({
          id: crypto.randomUUID(),
          accountId: globalOutRev,
          debit: 0,
          credit: preVat,
          description: baseDesc,
        });
      if (vat > 0)
        lines.push({
          id: crypto.randomUUID(),
          accountId: globalOutVat,
          debit: 0,
          credit: vat,
          description: `Thuế GTGT ${inv.invoiceNo}`,
        });
    }

    return {
      description: baseDesc,
      lines,
    };
  };

  const getComputedConfig = (inv: ErpInvoice): CustomConfig => {
    return customConfigs[inv.id] || getDefaultConfig(inv);
  };

  const isConfigModified = (
    conf: CustomConfig | undefined,
    inv: ErpInvoice,
  ) => {
    if (!conf) return false;
    const def = getDefaultConfig(inv);
    if (conf.lines.length !== def.lines.length) return true;
    for (let i = 0; i < conf.lines.length; i++) {
      if (conf.lines[i].accountId !== def.lines[i].accountId) return true;
      if (conf.lines[i].debit !== def.lines[i].debit) return true;
      if (conf.lines[i].credit !== def.lines[i].credit) return true;
    }
    return false;
  };

  const handleToggleCustom = (inv: ErpInvoice) => {
    setIsDirty(true);
    if (expandedId === inv.id) {
      setExpandedId(null);
    } else {
      setExpandedId(inv.id);
    }
  };

  const updateCustomLine = (
    invId: string,
    lineId: string,
    field: keyof PostInvoiceLine,
    value: any,
  ) => {
    setIsDirty(true);
    setCustomConfigs((prev) => {
      const inv = invoices.find((i) => i.id === invId);
      let conf = prev[invId];
      if (!conf && inv) {
        conf = getDefaultConfig(inv);
      }
      if (!conf) return prev;
      return {
        ...prev,
        [invId]: {
          ...conf,
          lines: conf.lines.map((l) =>
            l.id === lineId ? { ...l, [field]: value } : l,
          ),
        },
      };
    });
  };

  const addCustomLine = (invId: string) => {
    setIsDirty(true);
    setCustomConfigs((prev) => {
      const inv = invoices.find((i) => i.id === invId);
      let conf = prev[invId];
      if (!conf && inv) conf = getDefaultConfig(inv);
      if (!conf) return prev;
      return {
        ...prev,
        [invId]: {
          ...conf,
          lines: [
            ...conf.lines,
            {
              id: crypto.randomUUID(),
              accountId: "",
              debit: 0,
              credit: 0,
              description: conf.description,
            },
          ],
        },
      };
    });
  };

  const removeCustomLine = (invId: string, lineId: string) => {
    setIsDirty(true);
    setCustomConfigs((prev) => {
      const inv = invoices.find((i) => i.id === invId);
      let conf = prev[invId];
      if (!conf && inv) conf = getDefaultConfig(inv);
      if (!conf) return prev;
      return {
        ...prev,
        [invId]: {
          ...conf,
          lines: conf.lines.filter((l) => l.id !== lineId),
        },
      };
    });
  };

  // Validation
  const isValid = useMemo(() => {
    if (selectedInvoices.length === 0) return false;
    if (!globalDate) return false;

    return selectedInvoices.every((inv) => {
      const config = getComputedConfig(inv);
      if (config.lines.length === 0) return false;

      let totalDebit = 0;
      let totalCredit = 0;

      for (const l of config.lines) {
        if (!l.accountId) return false;
        totalDebit += l.debit;
        totalCredit += l.credit;
      }

      if (Math.abs(totalDebit - totalCredit) >= 0.01) return false;

      const invTotal = Number(inv.totalAmount) || 0;
      if (Math.abs(totalDebit - invTotal) >= 0.01) return false;

      return true;
    });
  }, [
    selectedInvoices,
    globalDate,
    globalInCost,
    globalInVat,
    globalInAp,
    globalOutAr,
    globalOutRev,
    globalOutVat,
    customConfigs,
  ]);

  const displayedInvoices = useMemo(() => {
    if (!searchTerm) return selectedInvoices;
    const lower = searchTerm.toLowerCase();
    return selectedInvoices.filter(
      (inv) =>
        inv.invoiceNo?.toLowerCase().includes(lower) ||
        inv.sellerName?.toLowerCase().includes(lower) ||
        inv.buyerName?.toLowerCase().includes(lower) ||
        inv.totalAmount?.toString().includes(lower),
    );
  }, [selectedInvoices, searchTerm]);

  const bulkPostMutation = useMutation({
    mutationFn: async () => {
      for (const inv of selectedInvoices) {
        const config = getComputedConfig(inv);
        await erpInvoicesCoreApi.postInvoice(inv.id, {
          postingDate: globalDate,
          documentDate: inv.invoiceDate,
          description: config.description,
          lines: config.lines.map((l) => ({
            accountId: l.accountId,
            debit: l.debit || 0,
            credit: l.credit || 0,
            description: l.description,
          })),
        });
      }
    },
    onSuccess: () => {
      toast.success("Hạch toán hàng loạt thành công!");
      setIsDirty(false);
      onSuccess();
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || err.message || "Có lỗi khi hạch toán",
      );
    },
  });

  const bulkUnpostMutation = useMutation({
    mutationFn: async () => {
      for (const inv of selectedInvoices) {
        await erpInvoicesCoreApi.unpostInvoice(inv.id);
      }
    },
    onSuccess: () => {
      toast.success("Hủy hạch toán hàng loạt thành công!");
      setIsDirty(false);
      onSuccess();
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          err.message ||
          "Có lỗi khi hủy hạch toán",
      );
    },
  });

  const postActions: DrawerAction[] = [
    {
      label: "Thực hiện hạch toán",
      primary: true,
      onClick: () => bulkPostMutation.mutate(),
      disabled: !isValid || bulkPostMutation.isPending,
      loading: bulkPostMutation.isPending,
    },
  ];

  if (mode === "unpost") {
    return (
      <ConfirmModal
        open={open}
        title={`Hủy hạch toán hàng loạt`}
        message={
          <div className="space-y-4">
            {selectedInvoices.length > 0 ? (
              <p>
                Bạn có chắc chắn muốn hủy hạch toán cho{" "}
                {selectedInvoices.length} hóa đơn?
              </p>
            ) : (
              <p className="text-red-600 font-medium">
                Không có hóa đơn nào khả dụng để hủy hạch toán!
              </p>
            )}
            {skippedInvoices.length > 0 && (
              <div className="flex items-start gap-2 py-2 px-3 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  Đã bỏ qua <strong>{skippedInvoices.length}</strong> hóa đơn
                  (HĐ:{" "}
                  {skippedInvoices
                    .slice(0, 3)
                    .map((i) => i.invoiceNo)
                    .join(", ")}
                  {skippedInvoices.length > 3 ? "..." : ""}) vì chưa được hạch
                  toán.
                </div>
              </div>
            )}
          </div>
        }
        confirmLabel="Hủy hạch toán"
        onConfirm={() => bulkUnpostMutation.mutate()}
        onCancel={onClose}
        loading={bulkUnpostMutation.isPending}
        confirmDisabled={selectedInvoices.length === 0}
        danger
      />
    );
  }

  return (
    <StandardFormDrawer
      open={open}
      onClose={onClose}
      mode="create"
      title="Hạch toán hàng loạt"
      subtitle={`Áp dụng cho ${selectedInvoices.length} hóa đơn`}
      layout="2-columns"
      size="xl"
      actions={postActions}
      confirmOnClose={isDirty}
      rightPanel={
        mode === "post" ? (
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col gap-4">
            <h3 className="text-sm font-medium text-slate-800">
              Cấu hình hạch toán chung
            </h3>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Ngày hạch toán <span className="text-red-500">*</span>
              </label>
              <DatePicker
                value={globalDate}
                onChange={(val) => {
                  setGlobalDate(val || "");
                  setIsDirty(true);
                }}
                placeholder="Chọn ngày"
              />
            </div>

            {direction === "IN" ? (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    TK Chi phí/Tài sản (Nợ){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Combobox
                    options={accountOptions}
                    value={globalInCost}
                    onChange={(val) => {
                      setGlobalInCost(val || "");
                      setIsDirty(true);
                    }}
                    placeholder="Tài khoản Nợ..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    TK Thuế GTGT (Nợ)
                  </label>
                  <Combobox
                    options={accountOptions}
                    value={globalInVat}
                    onChange={(val) => {
                      setGlobalInVat(val || "");
                      setIsDirty(true);
                    }}
                    placeholder="Tài khoản Thuế..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    TK Phải trả (Có) <span className="text-red-500">*</span>
                  </label>
                  <Combobox
                    options={accountOptions}
                    value={globalInAp}
                    onChange={(val) => {
                      setGlobalInAp(val || "");
                      setIsDirty(true);
                    }}
                    placeholder="Tài khoản Có..."
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    TK Phải thu (Nợ) <span className="text-red-500">*</span>
                  </label>
                  <Combobox
                    options={accountOptions}
                    value={globalOutAr}
                    onChange={(val) => {
                      setGlobalOutAr(val || "");
                      setIsDirty(true);
                    }}
                    placeholder="Tài khoản Nợ..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    TK Thuế GTGT (Có)
                  </label>
                  <Combobox
                    options={accountOptions}
                    value={globalOutVat}
                    onChange={(val) => {
                      setGlobalOutVat(val || "");
                      setIsDirty(true);
                    }}
                    placeholder="Tài khoản Thuế..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    TK Doanh thu (Có) <span className="text-red-500">*</span>
                  </label>
                  <Combobox
                    options={accountOptions}
                    value={globalOutRev}
                    onChange={(val) => {
                      setGlobalOutRev(val || "");
                      setIsDirty(true);
                    }}
                    placeholder="Tài khoản Có..."
                  />
                </div>
              </div>
            )}
          </div>
        ) : null
      }
      leftPanel={
        <div className="space-y-4">
          {skippedInvoices.length > 0 && (
            <div className="flex items-center gap-2 py-2 px-3 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                Đã bỏ qua <strong>{skippedInvoices.length}</strong> hóa đơn (HĐ:{" "}
                {skippedInvoices
                  .slice(0, 3)
                  .map((i) => i.invoiceNo)
                  .join(", ")}
                {skippedInvoices.length > 3 ? "..." : ""}) vì đã được hạch toán
                trước đó.
              </span>
            </div>
          )}

          {/* Invoice List */}
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-2">
              <h3 className="text-sm font-medium text-slate-800 shrink-0">
                Danh sách hóa đơn áp dụng{" "}
                {displayedInvoices.length < selectedInvoices.length &&
                  `(Hiển thị ${displayedInvoices.length}/${selectedInvoices.length})`}
              </h3>
              <div className="w-full md:w-80 shrink-0">
                <SearchInput
                  className="w-full"
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Tìm số HĐ, đối tác, số tiền..."
                  inputClassName="h-8 text-xs bg-white"
                />
              </div>
            </div>
            {displayedInvoices.length === 0 ? (
              <div className="text-sm text-slate-500 py-4 text-center bg-slate-50 rounded border border-dashed border-slate-200">
                Không tìm thấy hóa đơn nào phù hợp.
              </div>
            ) : (
              <div className="space-y-2">
                {displayedInvoices.map((inv) => {
                  const isModified = isConfigModified(
                    customConfigs[inv.id],
                    inv,
                  );
                  const config = getComputedConfig(inv);
                  const isExpanded = expandedId === inv.id;

                  // Validation for this specific row
                  const invTotal = Number(inv.totalAmount) || 0;
                  let error = null;
                  let totalDebit = 0;
                  let totalCredit = 0;

                  for (const l of config.lines) {
                    if (!l.accountId) error = "Thiếu tài khoản";
                    totalDebit += l.debit || 0;
                    totalCredit += l.credit || 0;
                  }

                  if (!error) {
                    if (Math.abs(totalDebit - totalCredit) >= 0.01) {
                      error = "Nợ/Có không cân";
                    } else if (Math.abs(totalDebit - invTotal) >= 0.01) {
                      error = "Số tiền không khớp HĐ";
                    }
                  }

                  return (
                    <div
                      key={inv.id}
                      className={`border rounded-lg overflow-hidden transition-colors ${
                        error ? "border-red-200" : "border-slate-200"
                      }`}
                    >
                      {/* Row Header */}
                      <div
                        className={`flex items-center justify-between py-1.5 px-3 bg-white ${
                          isExpanded ? "border-b border-slate-100" : ""
                        }`}
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[13px] text-slate-800">
                              HĐ: {inv.invoiceNo}
                            </span>
                            <span className="text-[11px] text-slate-500 line-clamp-1 max-w-[200px] md:max-w-xs">
                              {inv.sellerName || inv.buyerName || ""}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                            <span>
                              Tr.Thuế:{" "}
                              <strong className="text-slate-700 font-medium">
                                {money(inv.preVatAmount)}
                              </strong>
                            </span>
                            <span>
                              Tiền Thuế:{" "}
                              <strong className="text-slate-700 font-medium">
                                {money(inv.vatAmount)}
                                {inv.vatRate ? ` (${inv.vatRate}%)` : ""}
                              </strong>
                            </span>
                            <span className="text-xs">
                              Tổng tiền:{" "}
                              <strong className="text-slate-700 font-medium">
                                {money(inv.totalAmount)}
                              </strong>
                            </span>
                          </div>
                          {error && (
                            <div className="mt-1">
                              <span className="text-red-500 font-medium text-xs">
                                {error}
                              </span>
                            </div>
                          )}
                          <div className="text-xs text-slate-500 mt-0.5">
                            {isModified && !isExpanded && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {config.lines.map((l) => {
                                  const acc =
                                    accountOptions
                                      .find((a: any) => a.value === l.accountId)
                                      ?.label.split(" - ")[0] ||
                                    l.accountId ||
                                    "?";
                                  if (l.debit > 0)
                                    return (
                                      <span
                                        key={l.id}
                                        className="text-[10px] bg-slate-100 text-slate-600 px-1 rounded border border-slate-200"
                                      >
                                        Nợ {acc}: {money(l.debit)}
                                      </span>
                                    );
                                  if (l.credit > 0)
                                    return (
                                      <span
                                        key={l.id}
                                        className="text-[10px] bg-slate-100 text-slate-600 px-1 rounded border border-slate-200"
                                      >
                                        Có {acc}: {money(l.credit)}
                                      </span>
                                    );
                                  return null;
                                })}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isModified && (
                            <span className="text-[10px] font-medium bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                              Tùy chỉnh
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs px-2"
                            onClick={() => handleToggleCustom(inv)}
                          >
                            <Settings2 className="w-3.5 h-3.5 mr-1.5" />
                            {isExpanded
                              ? isModified
                                ? "Xong"
                                : "Thu gọn"
                              : isModified
                                ? "Sửa"
                                : "Tùy chỉnh"}
                          </Button>
                          {isModified && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => {
                                setIsDirty(true);
                                setCustomConfigs((prev) => {
                                  const newConfigs = { ...prev };
                                  delete newConfigs[inv.id];
                                  return newConfigs;
                                });
                              }}
                            >
                              Hủy
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Expanded Custom Form */}
                      {isExpanded && (
                        <div className="p-3 bg-slate-50 overflow-x-auto">
                          <div className="min-w-[650px]">
                            <div className="grid grid-cols-12 gap-1.5 mb-1.5 text-[11px] font-medium text-slate-500 px-1">
                              <div className="col-span-4">Tài khoản</div>
                              <div className="col-span-2 text-right">Nợ</div>
                              <div className="col-span-2 text-right">Có</div>
                              <div className="col-span-3">Diễn giải</div>
                              <div className="col-span-1"></div>
                            </div>

                            {config.lines.map((l) => (
                              <div
                                key={l.id}
                                className="grid grid-cols-12 gap-1.5 mb-1.5 items-center"
                              >
                                <div className="col-span-4">
                                  <Combobox
                                    options={accountOptions}
                                    value={l.accountId}
                                    onChange={(v) =>
                                      updateCustomLine(
                                        inv.id,
                                        l.id,
                                        "accountId",
                                        v || "",
                                      )
                                    }
                                    className="h-7 text-xs"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <NumberInput
                                    id={`debit-${l.id}`}
                                    value={l.debit}
                                    onChange={(v: number) =>
                                      updateCustomLine(inv.id, l.id, "debit", v)
                                    }
                                    className="h-7 text-xs text-right"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <NumberInput
                                    id={`credit-${l.id}`}
                                    value={l.credit}
                                    onChange={(v: number) =>
                                      updateCustomLine(
                                        inv.id,
                                        l.id,
                                        "credit",
                                        v,
                                      )
                                    }
                                    className="h-7 text-xs text-right"
                                  />
                                </div>
                                <div className="col-span-3">
                                  <Input
                                    className="h-7 text-xs"
                                    value={l.description}
                                    onChange={(e: any) =>
                                      updateCustomLine(
                                        inv.id,
                                        l.id,
                                        "description",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                                <div className="col-span-1 flex justify-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                                    onClick={() =>
                                      removeCustomLine(inv.id, l.id)
                                    }
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}

                            <div className="mt-3 flex items-center justify-between">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs border-dashed"
                                onClick={() => addCustomLine(inv.id)}
                              >
                                <Plus className="w-3.5 h-3.5 mr-1" />
                                Thêm dòng
                              </Button>
                              <div className="text-xs font-medium text-slate-700 mr-12">
                                Tổng cộng:{" "}
                                <span
                                  className={
                                    Math.abs(totalDebit - totalCredit) >= 0.01
                                      ? "text-red-500"
                                      : "text-emerald-600"
                                  }
                                >
                                  {money(totalDebit)} Nợ
                                </span>{" "}
                                /{" "}
                                <span
                                  className={
                                    Math.abs(totalDebit - totalCredit) >= 0.01
                                      ? "text-red-500"
                                      : "text-emerald-600"
                                  }
                                >
                                  {money(totalCredit)} Có
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      }
    />
  );
}
