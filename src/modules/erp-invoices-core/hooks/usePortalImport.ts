import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";

import {
  erpInvoicesCoreApi,
  type PortalInvoiceDto,
} from "../api/erpInvoicesCoreApi";

export function usePortalImport() {
  const [token, setToken] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [type, setType] = useState<"purchase" | "sale">("purchase");
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [items, setItems] = useState<PortalInvoiceDto[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<{
    imported: number;
    skipped: number;
    direction: "IN" | "OUT";
  } | null>(null);

  const selectedItems = useMemo(
    () => items.filter((item) => selected.has(makeKey(item))),
    [items, selected],
  );

  async function fetchList() {
    if (!token.trim()) {
      toast.error("Token là bắt buộc");
      return;
    }
    setLoading(true);
    try {
      const rows = await erpInvoicesCoreApi.portalFetch({
        token: token.trim(),
        dateFrom,
        dateTo,
        type,
      });
      setItems(rows);
      setSelected(new Set(rows.map(makeKey)));
      setResult(null);
      toast.success(`Đã lấy ${rows.length} hóa đơn`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể lấy danh sách");
    } finally {
      setLoading(false);
    }
  }

  async function importSelected() {
    if (!selectedItems.length) return;
    setImportLoading(true);
    try {
      const res = await erpInvoicesCoreApi.portalImport({
        token: token.trim(),
        type,
        items: selectedItems,
      });
      setResult(res);
      toast.success(
        `Đã nhập ${res.imported} hóa đơn, bỏ qua ${res.skipped} trùng`,
      );
      return res;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể import");
      return null;
    } finally {
      setImportLoading(false);
    }
  }

  function toggleSelect(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(items.map(makeKey)));
  }

  function deselectAll() {
    setSelected(new Set());
  }

  return {
    token,
    setToken,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    type,
    setType,
    loading,
    importLoading,
    items,
    selected,
    result,
    fetchList,
    importSelected,
    toggleSelect,
    selectAll,
    deselectAll,
  };
}

function makeKey(item: PortalInvoiceDto) {
  return `${item.shdon}__${item.khhdon ?? ""}`;
}
