import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DrawerModal,
  DrawerSection,
  DrawerAction,
} from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { Button } from "@/shared/components/ui/Button";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { accountingApi } from "@/modules/accounting/api/accountingApi";
import { formatGMT7, money } from "@/shared/utils/format";
import { erpInvoicesCoreApi } from "../api/erpInvoicesCoreApi";
import { DatePicker } from "@/shared/components/DatePicker";

interface PostInvoiceLine {
  id: string;
  accountId: string;
  debit: number;
  credit: number;
  description: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  invoiceId: string | null;
}

export function InvoicePostingDrawer({ open, onClose, invoiceId }: Props) {
  const queryClient = useQueryClient();

  // Fetch invoice
  const { data: invoice, isLoading: isLoadingInvoice } = useQuery({
    queryKey: ["erp-invoice", invoiceId],
    queryFn: () => erpInvoicesCoreApi.get(invoiceId!),
    enabled: open && !!invoiceId,
  });

  // Fetch Chart of Accounts
  const { data: chartOfAccounts } = useQuery({
    queryKey: ["chart-of-accounts", invoice?.branchId],
    queryFn: () =>
      accountingApi.getChartOfAccounts({ branchId: invoice?.branchId }),
    enabled: !!invoice?.branchId,
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

  const [lines, setLines] = useState<PostInvoiceLine[]>([]);
  const [description, setDescription] = useState("");
  const [postingDate, setPostingDate] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!invoice || !open) return;

    if (invoice.postingStatus === "POSTED") {
      // If already posted, ideally we should load the journal entry lines.
      // For now, we just show it's posted.
      setIsDirty(false);
      return;
    }

    // Pre-fill
    const defaultDate = invoice.invoiceDate
      ? invoice.invoiceDate.slice(0, 10)
      : new Date().toISOString().slice(0, 10);
    setPostingDate(defaultDate);
    setDescription(
      invoice.description || `Hạch toán hóa đơn ${invoice.invoiceNo}`,
    );

    const newLines: PostInvoiceLine[] = [];
    const preVat = Number(invoice.preVatAmount) || 0;
    const vat = Number(invoice.vatAmount) || 0;
    const total = Number(invoice.totalAmount) || 0;

    const baseDesc =
      invoice.description || `Hạch toán hóa đơn ${invoice.invoiceNo}`;

    const findAccount = (prefix: string) =>
      accountOptions.find((a: any) =>
        a.label.split(" - ")[0]?.startsWith(prefix),
      )?.value || "";

    if (invoice.direction === "IN") {
      // Mua hàng: Nợ chi phí/tài sản (preVat), Nợ VAT (133), Có 331 (total)
      if (preVat > 0) {
        newLines.push({
          id: crypto.randomUUID(),
          accountId:
            findAccount("642") || findAccount("152") || findAccount("156"),
          debit: preVat,
          credit: 0,
          description: baseDesc,
        });
      }
      if (vat > 0) {
        newLines.push({
          id: crypto.randomUUID(),
          accountId: findAccount("133"), // User must select 133
          debit: vat,
          credit: 0,
          description: `Thuế GTGT ${invoice.invoiceNo}`,
        });
      }
      if (total > 0) {
        newLines.push({
          id: crypto.randomUUID(),
          accountId: findAccount("331"), // User must select 331
          debit: 0,
          credit: total,
          description: baseDesc,
        });
      }
    } else {
      // Bán hàng: Nợ 131 (total), Có doanh thu (preVat), Có VAT (333) (vat)
      if (total > 0) {
        newLines.push({
          id: crypto.randomUUID(),
          accountId: findAccount("131"), // User must select 131
          debit: total,
          credit: 0,
          description: baseDesc,
        });
      }
      if (preVat > 0) {
        newLines.push({
          id: crypto.randomUUID(),
          accountId: findAccount("511"), // Doanh thu
          debit: 0,
          credit: preVat,
          description: baseDesc,
        });
      }
      if (vat > 0) {
        newLines.push({
          id: crypto.randomUUID(),
          accountId: findAccount("333"), // Thuế 333
          debit: 0,
          credit: vat,
          description: `Thuế GTGT ${invoice.invoiceNo}`,
        });
      }
    }

    setLines(newLines);
    setIsDirty(false);
  }, [invoice, open, accountOptions]);

  const totalDebit = lines.reduce((sum, l) => sum + (l.debit || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (l.credit || 0), 0);
  const invTotal = invoice ? Number(invoice.totalAmount) || 0 : 0;

  const handleAddLine = () => {
    setLines([
      ...lines,
      {
        id: crypto.randomUUID(),
        accountId: "",
        debit: 0,
        credit: 0,
        description,
      },
    ]);
    setIsDirty(true);
  };

  const handleUpdateLine = (
    id: string,
    field: keyof PostInvoiceLine,
    value: any,
  ) => {
    setLines(lines.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
    setIsDirty(true);
  };

  const handleRemoveLine = (id: string) => {
    setLines(lines.filter((l) => l.id !== id));
    setIsDirty(true);
  };

  const postMutation = useMutation({
    mutationFn: async () => {
      if (!invoiceId) throw new Error("Missing invoice ID");
      return erpInvoicesCoreApi.postInvoice(invoiceId, {
        postingDate,
        description,
        lines: lines.map((l) => ({
          accountId: l.accountId,
          debit: l.debit || 0,
          credit: l.credit || 0,
          description: l.description,
        })),
      });
    },
    onSuccess: () => {
      toast.success("Hạch toán thành công!");
      queryClient.invalidateQueries({ queryKey: ["erp-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["erp-invoice", invoiceId] });
      setIsDirty(false);
      onClose();
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || err.message || "Lỗi hạch toán",
      );
    },
  });

  const unpostMutation = useMutation({
    mutationFn: async () => {
      if (!invoiceId) throw new Error("Missing invoice ID");
      return erpInvoicesCoreApi.unpostInvoice(invoiceId);
    },
    onSuccess: () => {
      toast.success("Bỏ hạch toán thành công!");
      queryClient.invalidateQueries({ queryKey: ["erp-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["erp-invoice", invoiceId] });
      setIsDirty(false);
      onClose();
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || err.message || "Lỗi bỏ hạch toán",
      );
    },
  });

  const isValid =
    lines.length > 0 &&
    lines.every((l) => !!l.accountId) &&
    Math.abs(totalDebit - totalCredit) < 0.01 &&
    Math.abs(totalDebit - invTotal) < 0.01;

  const isPosted = invoice?.postingStatus === "POSTED";

  const actions: DrawerAction[] = [];

  if (isPosted) {
    actions.push({
      label: "Bỏ hạch toán",
      variant: "danger",
      onClick: () => unpostMutation.mutate(),
      loading: unpostMutation.isPending,
    });
  } else {
    actions.push({
      label: "Lưu hạch toán",
      primary: true,
      onClick: () => postMutation.mutate(),
      loading: postMutation.isPending,
      disabled: !isValid || !postingDate,
    });
  }

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title={isPosted ? "Chi tiết hạch toán hóa đơn" : "Hạch toán hóa đơn"}
      panelClassName="w-full md:w-[95vw] lg:w-[800px]"
      confirmOnClose={isDirty && !isPosted}
      actions={actions}
    >
      {isLoadingInvoice ? (
        <div className="p-4 text-center text-gray-500">Đang tải dữ liệu...</div>
      ) : invoice ? (
        <div className="space-y-6">
          <DrawerSection title="Thông tin chung">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày hạch toán *
                </label>
                <DatePicker
                  value={postingDate}
                  onChange={(date: string) => {
                    setPostingDate(date);
                    setIsDirty(true);
                  }}
                  disabled={isPosted}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diễn giải chung
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setIsDirty(true);
                  }}
                  disabled={isPosted}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background disabled:bg-gray-100"
                />
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Giá trước thuế:</span>
                  <div className="font-medium">
                    {money(invoice.preVatAmount)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Thuế GTGT:</span>
                  <div className="font-medium">{money(invoice.vatAmount)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Tổng thanh toán:</span>
                  <div className="font-medium text-blue-700">
                    {money(invoice.totalAmount)}
                  </div>
                </div>
              </div>
            </div>
          </DrawerSection>

          <DrawerSection title="Chi tiết bút toán">
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium w-[30%]">
                      Tài khoản
                    </th>
                    <th className="px-3 py-2 text-right font-medium w-[20%]">
                      Nợ
                    </th>
                    <th className="px-3 py-2 text-right font-medium w-[20%]">
                      Có
                    </th>
                    <th className="px-3 py-2 text-left font-medium w-[25%]">
                      Diễn giải
                    </th>
                    {!isPosted && <th className="px-3 py-2 w-[5%]"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {lines.map((line, index) => (
                    <tr key={line.id} className="hover:bg-gray-50">
                      <td className="px-2 py-2">
                        <Combobox
                          options={accountOptions}
                          value={line.accountId}
                          onChange={(val) =>
                            handleUpdateLine(line.id, "accountId", val)
                          }
                          placeholder="-- Chọn --"
                          disabled={isPosted}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          className="w-full h-8 px-2 text-right border rounded disabled:bg-gray-100"
                          value={line.debit || ""}
                          onChange={(e) =>
                            handleUpdateLine(
                              line.id,
                              "debit",
                              Number(e.target.value),
                            )
                          }
                          disabled={isPosted}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          className="w-full h-8 px-2 text-right border rounded disabled:bg-gray-100"
                          value={line.credit || ""}
                          onChange={(e) =>
                            handleUpdateLine(
                              line.id,
                              "credit",
                              Number(e.target.value),
                            )
                          }
                          disabled={isPosted}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          className="w-full h-8 px-2 border rounded disabled:bg-gray-100"
                          value={line.description}
                          onChange={(e) =>
                            handleUpdateLine(
                              line.id,
                              "description",
                              e.target.value,
                            )
                          }
                          disabled={isPosted}
                        />
                      </td>
                      {!isPosted && (
                        <td className="px-2 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(line.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t font-medium">
                  <tr>
                    <td className="px-3 py-2 text-right">Tổng cộng:</td>
                    <td
                      className={`px-3 py-2 text-right ${Math.abs(totalDebit - invTotal) > 0.01 ? "text-red-600" : "text-green-600"}`}
                    >
                      {money(totalDebit)}
                    </td>
                    <td
                      className={`px-3 py-2 text-right ${Math.abs(totalCredit - invTotal) > 0.01 ? "text-red-600" : "text-green-600"}`}
                    >
                      {money(totalCredit)}
                    </td>
                    <td colSpan={isPosted ? 1 : 2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {!isPosted && (
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddLine}
                  className="gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Thêm dòng
                </Button>
              </div>
            )}

            {!isPosted &&
              (Math.abs(totalDebit - totalCredit) > 0.01 ||
                Math.abs(totalDebit - invTotal) > 0.01) && (
                <p className="mt-2 text-sm text-red-500 flex items-center">
                  * Tổng Nợ và Tổng Có phải bằng nhau và bằng Tổng thanh toán
                  hóa đơn.
                </p>
              )}
          </DrawerSection>
        </div>
      ) : (
        <div className="p-4 text-center text-red-500">
          Không tìm thấy thông tin hóa đơn
        </div>
      )}
    </DrawerModal>
  );
}
