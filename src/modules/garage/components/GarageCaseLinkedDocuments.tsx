import React, { useState, useEffect } from "react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Combobox } from "@/shared/components/Combobox";
import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { useQuery } from "@tanstack/react-query";

interface LinkedDoc {
  id: string; // The linked id in db
  type: string; // IN or OUT
  refNo: string; // Invoice number
  refId: string; // Invoice ID
  detail?: string;
  isNew?: boolean; // Temporary flag
}

interface Props {
  linkedDocs?: LinkedDoc[];
  editMode?: boolean;
  pendingChanges?: any[];
  setPendingChanges?: (changes: any[]) => void;
  isLoading?: boolean;
}

function createClientId() {
  return `tmp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function GarageCaseLinkedDocuments({
  linkedDocs = [],
  editMode = false,
  pendingChanges = [],
  setPendingChanges,
  isLoading,
}: Props) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<any[]>([]);

  // Trộn dữ liệu gốc và pendingChanges để hiển thị
  useEffect(() => {
    const combined: any[] = [];
    const removedIds = pendingChanges
      .filter((p) => p.action === "REMOVE")
      .map((p) => p.id);

    linkedDocs.forEach((doc) => {
      if (removedIds.includes(doc.id)) return;
      combined.push({
        id: doc.id,
        type: doc.type,
        refNo: doc.refNo,
        refId: doc.refId,
        detail: doc.detail,
        isNew: false,
      });
    });

    pendingChanges
      .filter((p) => p.action === "ADD")
      .forEach((p) => {
        const inv = invoices.find((i) => i.id === p.refId);
        combined.push({
          id: p.refId, // Use refId as temp row id
          type: p.linkType === "IN" ? "HĐ Mua vào" : "HĐ Bán ra",
          refNo: inv
            ? `${inv.invoiceNo || "---"} - ${inv.buyerName || inv.sellerName || "---"}`
            : "Đang chờ lưu",
          refId: p.refId,
          isNew: false, // Treat as existing so it has remove button
        });
      });

    const uiRows = editMode ? rows.filter((r) => r.isNew) : [];
    setRows([...combined, ...uiRows]);
  }, [linkedDocs, pendingChanges, editMode, invoices]);

  const { data: searchResults, isFetching } = useQuery({
    queryKey: ["erp-invoices-search", searchQuery, page],
    queryFn: () =>
      erpInvoicesCoreApi.list({
        page,
        pageSize: 20,
        search: searchQuery,
      }),
    enabled: editMode,
  });

  useEffect(() => {
    if (searchResults?.items) {
      if (page === 1) {
        setInvoices(searchResults.items);
      } else {
        setInvoices((prev) => {
          const newItems = searchResults.items.filter(
            (newItem: any) => !prev.some((p) => p.id === newItem.id),
          );
          return [...prev, ...newItems];
        });
      }
    }
  }, [searchResults, page]);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setPage(1);
  };

  const handleScrollBottom = () => {
    if (!isFetching && searchResults && page < searchResults.totalPages) {
      setPage((p) => p + 1);
    }
  };

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        id: createClientId(),
        type: "OUT", // Default OUT
        refId: "",
        refNo: "",
        isNew: true,
      },
    ]);
  };

  const updateRowType = (rowId: string, type: "IN" | "OUT") => {
    setRows(
      rows.map((r) =>
        r.id === rowId ? { ...r, type, refId: "", refNo: "" } : r,
      ),
    );
  };

  const handleSelectInvoice = (
    rowId: string,
    invoiceId: string,
    invoiceType: "IN" | "OUT",
  ) => {
    if (setPendingChanges) {
      setPendingChanges([
        ...pendingChanges,
        { action: "ADD", refId: invoiceId, linkType: invoiceType },
      ]);
    }
    setRows(rows.filter((r) => r.id !== rowId));
  };

  const handleRemoveRow = (row: any) => {
    if (row.isNew) {
      setRows(rows.filter((r) => r.id !== row.id));
      return;
    }
    if (setPendingChanges) {
      setPendingChanges([...pendingChanges, { action: "REMOVE", id: row.id }]);
    }
  };

  const formatNumber = (val: string | number | null | undefined) => {
    if (val == null) return "0";
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num) ? "0" : new Intl.NumberFormat("vi-VN").format(num);
  };

  const openDocument = (id: string) => {
    window.dispatchEvent(
      new CustomEvent("open_erp_document", {
        detail: { type: "erp_invoice", id },
      }),
    );
  };

  return (
    <div className="flex-1 min-w-0 w-full relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
        </div>
      )}
      <DrawerSection
        title="CHỨNG TỪ LIÊN KẾT"
        titleExtra={
          editMode && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={handleAddRow}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Thêm chứng từ
            </Button>
          )
        }
      >
        {rows.length === 0 ? (
          <div className="text-sm text-gray-500 py-4 text-center border border-dashed rounded bg-gray-50">
            Chưa có chứng từ liên kết nào.
          </div>
        ) : (
          <div className="border rounded-md overflow-x-auto bg-white shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-3 py-2.5 font-medium text-slate-700 w-1/4">
                    Loại chứng từ
                  </th>
                  <th className="px-3 py-2.5 font-medium text-slate-700 w-1/3">
                    Chứng từ
                  </th>
                  <th className="px-3 py-2.5 font-medium text-slate-700 w-1/4 text-right">
                    Chi tiết
                  </th>
                  <th className="px-3 py-2.5 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 group">
                    <td className="px-3 py-2">
                      {row.isNew ? (
                        <Combobox
                          options={[
                            { value: "OUT", label: "HĐ Bán ra (OUT)" },
                            { value: "IN", label: "HĐ Mua vào (IN)" },
                          ]}
                          value={row.type}
                          onChange={(val) =>
                            updateRowType(row.id, val as "IN" | "OUT")
                          }
                          allowClear={false}
                        />
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                          {row.type}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {row.isNew ? (
                        <Combobox
                          options={invoices
                            .filter(
                              (inv) =>
                                inv.direction === row.type ||
                                (!inv.direction && row.type === "OUT"),
                            ) // Assuming direction matches
                            .map((inv) => ({
                              value: inv.id,
                              label: `${inv.invoiceNo || "---"} - ${inv.buyerName || inv.sellerName || "---"} (${formatNumber(inv.totalAmount)})`,
                              searchText: `${inv.invoiceNo} ${inv.buyerName} ${inv.sellerName}`,
                            }))}
                          value={row.refId}
                          onChange={(val) =>
                            handleSelectInvoice(row.id, val, row.type)
                          }
                          onSearch={handleSearch}
                          onScrollBottom={handleScrollBottom}
                          loading={isFetching}
                          placeholder="Tìm hóa đơn..."
                        />
                      ) : (
                        <span
                          className="text-primary font-medium flex items-center gap-1.5 w-fit cursor-pointer hover:underline group/link"
                          onClick={() => openDocument(row.refId)}
                        >
                          <span className="line-clamp-1 group-hover/link:underline">
                            {row.refNo}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover/link:opacity-100 transition-all flex-shrink-0" />
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right text-sm text-muted-foreground">
                      {!row.isNew && (row.detail || "—")}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {editMode && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveRow(row)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DrawerSection>
    </div>
  );
}
