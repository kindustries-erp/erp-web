import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  erpInvoicesCoreApi,
  type PortalSyncResult,
} from "../api/erpInvoicesCoreApi";

const TOKEN_KEY = "erp_portal_token";

function loadToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
}

function saveToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
}

export function usePortalSync() {
  const [token, setTokenState] = useState<string>(loadToken);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PortalSyncResult | null>(null);

  const setToken = useCallback((t: string) => {
    setTokenState(t);
    saveToken(t);
  }, []);

  const sync = useCallback(
    async (type: "purchase" | "sold") => {
      if (!token.trim()) {
        toast.error("Vui lòng nhập Bearer token trong cấu hình");
        return null;
      }
      if (!dateFrom || !dateTo) {
        toast.error("Vui lòng chọn khoảng thời gian");
        return null;
      }
      setLoading(true);
      setResult(null);
      try {
        const res = await erpInvoicesCoreApi.portalSync({
          token: token.trim(),
          dateFrom,
          dateTo,
          type,
        });
        setResult(res);
        toast.success(
          `Đã đồng bộ ${res.imported} HĐ mới, bỏ qua ${res.skipped} trùng. Đang tải ${res.xmlDownloadQueued} file XML...`,
          { duration: 6000 },
        );
        return res;
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Đồng bộ thất bại");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token, dateFrom, dateTo],
  );

  return {
    token,
    setToken,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    loading,
    result,
    sync,
    clearResult: () => setResult(null),
  };
}
