import * as React from "react";
import { V2AttachmentsPanel } from "@/v2/shared/components";
import { createV2OwnerFilesApi } from "@/v2/shared/files";
import { useV2HasPermission } from "@/v2/shared/hooks/useV2HasPermission";

/** Tab "Tài liệu": file đính kèm của hóa đơn qua `/api/v2/invoices/:id/attachments` */
export const InvoiceAttachmentsTab: React.FC<{
  api: ReturnType<typeof createV2OwnerFilesApi>;
}> = ({ api }) => {
  const canEdit = useV2HasPermission({
    collection: "invoices",
    action: "update",
  });
  return (
    <V2AttachmentsPanel api={api} canEdit={canEdit} defaultCategory="HOA_DON" />
  );
};
