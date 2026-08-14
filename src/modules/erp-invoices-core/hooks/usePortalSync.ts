import { useState, useCallback, useEffect } from "react";
import { toast } from "react-hot-toast";
import { parseISO, isValid, isBefore, differenceInDays } from "date-fns";
import {
  erpInvoicesCoreApi,
  type PortalSyncResult,
} from "../api/erpInvoicesCoreApi";

export function usePortalSync() {
  const [token, setTokenState] = useState<string>("");
  const [cookies, setCookiesState] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PortalSyncResult | null>(null);
  const [isTokenLoaded, setIsTokenLoaded] = useState(false);

  const refreshConfig = useCallback(async () => {
    try {
      const res = await erpInvoicesCoreApi.getPortalConfig();
      if (res) {
        setTokenState(res.token || "");
        setCookiesState(res.cookies || "");
      }
      setIsTokenLoaded(true);
    } catch {
      setIsTokenLoaded(true);
    }
  }, []);

  useEffect(() => {
    refreshConfig();
  }, [refreshConfig]);

  const saveConfig = useCallback(
    async (t: string, c?: string, u?: string, p?: string) => {
      setTokenState(t);
      if (c !== undefined) setCookiesState(c);
      try {
        await erpInvoicesCoreApi.savePortalConfig(t, c, u, p);
        toast.success("Đã lưu cấu hình portal thành công!");
      } catch {
        toast.error("Lưu cấu hình portal thất bại");
      }
    },
    [],
  );

  const sync = useCallback(
    async (type: "purchase" | "sold") => {
      if (!dateFrom || !dateTo) {
        toast.error("Vui lòng chọn từ ngày và đến ngày");
        return;
      }

      const dFrom = parseISO(dateFrom);
      const dTo = parseISO(dateTo);

      if (isValid(dFrom) && isValid(dTo)) {
        if (isBefore(dTo, dFrom)) {
          toast.error("Ngày đến không được nhỏ hơn ngày từ");
          return;
        }
        const diff = differenceInDays(dTo, dFrom);
        if (diff > 30) {
          toast.error("Chỉ được chọn khoảng thời gian tối đa 30 ngày");
          return;
        }
      } else {
        toast.error("Ngày không hợp lệ");
        return;
      }

      setLoading(true);
      setResult(null);
      try {
        const res = await erpInvoicesCoreApi.portalSync({
          token: "",
          cookies: "",
          dateFrom,
          dateTo,
          type,
        });
        setResult(res);
        toast.success(
          res.note ||
            `Đã đồng bộ ${res.imported} HĐ mới, bỏ qua ${res.skipped} trùng. Đang tải ${res.xmlDownloadQueued} file XML...`,
          { duration: 6000 },
        );
        return res;
      } catch (e: any) {
        const message = e?.response?.data?.message;
        if (message === "GDT_TOKEN_EXPIRED") {
          toast.error("Token hết hạn! Vui lòng cập nhật lại token từ GDT", {
            duration: 5000,
          });
        } else if (message === "GDT_TAXPAYER_MISMATCH") {
          toast.error(
            "Token GDT đang đăng nhập khác mã số thuế công ty trên hệ thống. Vui lòng kiểm tra lại.",
            { duration: 6000 },
          );
        } else if (message === "GDT_COMPANY_TAX_CODE_NOT_CONFIGURED") {
          toast.error(
            "Chưa cấu hình mã số thuế công ty trong hồ sơ doanh nghiệp, chưa thể đồng bộ GDT.",
            { duration: 6000 },
          );
        } else if (message === "GDT_PROFILE_FETCH_FAILED") {
          toast.error(
            "Không lấy được hồ sơ người nộp thuế từ GDT. Vui lòng thử lại.",
            { duration: 6000 },
          );
        } else if (message === "GDT_PROFILE_MISSING_TAX_CODE") {
          toast.error(
            "Hồ sơ GDT không trả về mã số thuế hợp lệ để đối chiếu.",
            { duration: 6000 },
          );
        } else {
          toast.error("Có lỗi xảy ra khi đồng bộ từ TCT");
        }
      } finally {
        setLoading(false);
      }
    },
    [dateFrom, dateTo],
  );

  return {
    token,
    cookies,
    saveConfig,
    refreshConfig,
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
