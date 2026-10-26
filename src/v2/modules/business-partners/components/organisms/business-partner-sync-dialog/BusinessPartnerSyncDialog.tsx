import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { V2Button, V2Modal } from "@/v2/shared/components";
import { businessPartnersV2Api } from "../../../api/businessPartnersApi";
import { businessPartnerKeys } from "../../../api/queries/businessPartnerKeys";
import { useSyncBusinessPartnersMutation } from "../../../api/mutations/useSyncBusinessPartnersMutation";
import type { BusinessPartnerSyncDialogProps } from "./BusinessPartnerSyncDialog.type";

/**
 * Xem trước đồng bộ đối tác từ hóa đơn (dryRun), chỉ tạo khi người dùng xác nhận.
 */
export const BusinessPartnerSyncDialog: React.FC<
  BusinessPartnerSyncDialogProps
> = ({ open, onOpenChange, t }) => {
  const preview = useQuery({
    queryKey: businessPartnerKeys.syncPreview,
    queryFn: () => businessPartnersV2Api.syncFromInvoices(true),
    enabled: open,
    staleTime: 0,
  });
  const sync = useSyncBusinessPartnersMutation(t);

  const count = preview.data?.count ?? 0;
  const items = preview.data?.items ?? [];

  const confirm = async () => {
    await sync.mutateAsync();
    onOpenChange(false);
  };

  return (
    <V2Modal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title={t("v2.partners.sync.previewTitle", "Đối tác sẽ tạo từ hóa đơn")}
      description={
        preview.isSuccess
          ? t("v2.partners.sync.previewCount", "{{count}} đối tác mới").replace(
              "{{count}}",
              String(count),
            )
          : undefined
      }
      footer={
        <div className="flex justify-end gap-2">
          <V2Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            {t("v2.form.cancel", "Hủy")}
          </V2Button>
          <V2Button
            size="sm"
            disabled={!preview.isSuccess || count === 0 || sync.isPending}
            onClick={confirm}
          >
            {t("v2.partners.sync.confirm", "Tạo đối tác")}
          </V2Button>
        </div>
      }
    >
      {preview.isLoading && (
        <p className="text-sm text-muted-foreground">
          {t("v2.form.searching", "Đang tìm...")}
        </p>
      )}
      {preview.isError && (
        <p className="text-sm text-destructive">
          {t("v2.partners.sync.error", "Không thể đồng bộ đối tác từ hóa đơn")}
        </p>
      )}
      {preview.isSuccess && count === 0 && (
        <p className="text-sm text-muted-foreground">
          {t("v2.partners.sync.none", "Không có đối tác mới cần tạo")}
        </p>
      )}
      {items.length > 0 && (
        <div className="max-h-[60vh] overflow-auto rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted/60 text-left">
              <tr>
                <th className="px-3 py-2">
                  {t("v2.partners.columns.name", "Tên đối tác")}
                </th>
                <th className="px-3 py-2">
                  {t("v2.partners.columns.taxCode", "Mã số thuế")}
                </th>
                <th className="px-3 py-2">
                  {t("v2.partners.columns.address", "Địa chỉ")}
                </th>
                <th className="px-3 py-2">
                  {t("v2.partners.sync.type", "Loại")}
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.taxCode} className="border-t border-border">
                  <td className="px-3 py-1.5">{item.name}</td>
                  <td className="px-3 py-1.5 font-mono">{item.taxCode}</td>
                  <td className="px-3 py-1.5 truncate max-w-[280px]">
                    {item.address || "—"}
                  </td>
                  <td className="px-3 py-1.5">
                    {item.partnerType === "CUSTOMER"
                      ? t("v2.partners.customersTitle", "Khách hàng")
                      : t("v2.partners.suppliersTitle", "Nhà cung cấp")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </V2Modal>
  );
};
