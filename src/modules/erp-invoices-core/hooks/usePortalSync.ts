import { useState, useCallback, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  erpInvoicesCoreApi,
  type PortalSyncResult,
} from "../api/erpInvoicesCoreApi";

export function usePortalSync() {
  const [token, setTokenState] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PortalSyncResult | null>(null);
  const [isTokenLoaded, setIsTokenLoaded] = useState(false);

  useEffect(() => {
    erpInvoicesCoreApi
      .getPortalToken()
      .then((res) => {
        setTokenState(res.token);
        setIsTokenLoaded(true);
      })
      .catch(() => {
        setIsTokenLoaded(true);
      });
  }, []);

  const setToken = useCallback(async (t: string) => {
    setTokenState(t);
    try {
      await erpInvoicesCoreApi.savePortalToken(t);
      toast.success("Đã lưu cấu hình token thành công!");
    } catch {
      toast.error("Lưu cấu hình token thất bại");
    }
  }, []);

  const sync = useCallback(
    async (type: "purchase" | "sold") => {
      if (!dateFrom || !dateTo) {
        toast.error("Vui lòng chọn từ ngày và đến ngày");
        return;
      }
      setLoading(true);
      setResult(null);
      try {
        const payload = {
          token: "",
          direction: type === "purchase" ? "IN" : ("OUT" as "IN" | "OUT"),
          from: dateFrom,
          to: dateTo,
        };
        const res = await erpInvoicesCoreApi.portalSync(payload);
        setResult(res);
        toast.success(`Đã đồng bộ ${res.count} hóa đơn thành công!`);
      } catch {
        toast.error("Có lỗi xảy ra khi đồng bộ từ TCT");
      } finally {
        setLoading(false);
      }
    },
    [dateFrom, dateTo],
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
    isTokenLoaded,
    clearResult: () => setResult(null),
  };
}
