import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { parseISO, isValid, isBefore } from "date-fns";
import {
  erpInvoicesCoreApi,
  type PortalSyncResult,
} from "../api/erpInvoicesCoreApi";
import { portalConfigKey, usePortalConfigQuery } from "./usePortalConfigQuery";
import { mapPortalSyncError } from "./portalSyncError.helper";

export interface PortalSyncRange {
  dateFrom: string;
  dateTo: string;
}

/** Đồng bộ hóa đơn GDT: cấu hình qua query, thao tác đồng bộ qua mutation */
export function usePortalSync() {
  const { t } = useTranslation("erpInvoices");
  const queryClient = useQueryClient();
  const configQuery = usePortalConfigQuery();
  const [needsRelogin, setNeedsRelogin] = useState(false);
  const [result, setResult] = useState<PortalSyncResult | null>(null);

  const invalidateConfig = useCallback(
    () => queryClient.invalidateQueries({ queryKey: portalConfigKey }),
    [queryClient],
  );

  const saveMutation = useMutation({
    mutationFn: ({
      token,
      cookies,
      username,
      password,
    }: {
      token: string;
      cookies?: string;
      username?: string;
      password?: string;
    }) =>
      erpInvoicesCoreApi.savePortalConfig(token, cookies, username, password),
    onSuccess: () => {
      toast.success(
        t("portalConfigSaved", "Đã lưu cấu hình portal thành công!"),
      );
      setNeedsRelogin(false);
      void invalidateConfig();
    },
    onError: () => {
      toast.error(t("portalConfigSaveFailed", "Lưu cấu hình portal thất bại"));
    },
  });

  const syncMutation = useMutation<
    PortalSyncResult,
    unknown,
    { type: "purchase" | "sold"; range: PortalSyncRange }
  >({
    mutationFn: ({ type, range }) =>
      erpInvoicesCoreApi.portalSync({
        dateFrom: range.dateFrom,
        dateTo: range.dateTo,
        type,
      }),
    onSuccess: (res) => {
      setNeedsRelogin(false);
      toast.success(
        res.note ||
          t("portalSyncSuccess", {
            defaultValue:
              "Đã đồng bộ {{imported}} HĐ mới, bỏ qua {{skipped}} trùng. Đang tải {{queued}} file XML...",
            imported: res.imported,
            skipped: res.skipped,
            queued: res.xmlDownloadQueued,
          }),
        { duration: 6000 },
      );
    },
    onError: (err) => {
      const mapped = mapPortalSyncError(err);
      if (mapped.needsRelogin) setNeedsRelogin(true);
      toast.error(t(mapped.key, mapped.fallback), { duration: 6000 });
    },
  });

  const refreshConfig = invalidateConfig;

  const saveConfig = useCallback(
    (token: string, cookies?: string, username?: string, password?: string) =>
      saveMutation.mutateAsync({ token, cookies, username, password }).then(
        () => undefined,
        () => undefined,
      ),
    [saveMutation],
  );

  /** Kiểm tra khoảng ngày rồi đồng bộ. Trả về kết quả hoặc `undefined` khi lỗi. */
  const sync = useCallback(
    async (type: "purchase" | "sold", range: PortalSyncRange) => {
      if (!range.dateFrom || !range.dateTo) {
        toast.error(
          t("portalSyncRangeRequired", "Vui lòng chọn từ ngày và đến ngày"),
        );
        return undefined;
      }
      const dFrom = parseISO(range.dateFrom);
      const dTo = parseISO(range.dateTo);
      if (!isValid(dFrom) || !isValid(dTo)) {
        toast.error(t("portalSyncDateInvalid", "Ngày không hợp lệ"));
        return undefined;
      }
      if (isBefore(dTo, dFrom)) {
        toast.error(
          t("portalSyncRangeOrder", "Ngày đến không được nhỏ hơn ngày từ"),
        );
        return undefined;
      }

      setResult(null);
      try {
        const res = await syncMutation.mutateAsync({ type, range });
        setResult(res);
        return res;
      } catch {
        return undefined;
      }
    },
    [syncMutation, t],
  );

  const config = configQuery.data;

  return {
    hasToken: config?.hasToken ?? false,
    hasPassword: config?.hasPassword ?? false,
    username: config?.username ?? "",
    needsRelogin,
    setNeedsRelogin,
    saveConfig,
    refreshConfig,
    loading: syncMutation.isPending,
    result,
    sync,
    isTokenLoaded: configQuery.isFetched,
    clearResult: () => setResult(null),
  };
}
