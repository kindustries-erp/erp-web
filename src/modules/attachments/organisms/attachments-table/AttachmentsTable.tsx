import React from "react";
import { Paperclip } from "lucide-react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { useT } from "@/core/i18n";
import type { ErpAttachment } from "../../types/attachment.types";
import { useAttachmentsTable } from "./AttachmentsTable.hook";
import { getAttachmentsColumns } from "./AttachmentsTable.columns";
import type { AttachmentsTableProps } from "./AttachmentsTable.type";

export function AttachmentsTable({
  onSelectAttachment,
  onOpenInvoiceDetail,
}: AttachmentsTableProps) {
  const t = useT();
  const tableState = useAttachmentsTable();

  const columns = React.useMemo(
    () =>
      getAttachmentsColumns(
        tableState,
        onSelectAttachment,
        onOpenInvoiceDetail,
      ),
    [tableState, onSelectAttachment, onOpenInvoiceDetail],
  );

  return (
    <SpreadsheetPageTemplate<ErpAttachment>
      title={t("nav.items.attachments", "Quản lý tài liệu")}
      desc={t(
        "dinhkem.desc",
        "Quản lý tài liệu upload tập trung trong hệ thống",
      )}
      icon={<Paperclip className="h-4 w-4" />}
      tableId="attachments-table"
      items={tableState.items}
      columns={columns}
      getRowKey={(a) => a.id}
      loading={tableState.loading}
      error={tableState.fetchError}
      emptyLabel={t("dinhkem.empty", "Chưa có tài liệu đính kèm.")}
      minWidth={900}
      page={tableState.page}
      pageSize={tableState.pageSize}
      total={tableState.total}
      totalPages={tableState.totalPages}
      onPage={tableState.setPage}
      onPageSize={(size) => {
        tableState.setPageSize(size);
        tableState.setPage(1);
      }}
      onRefresh={tableState.loadData}
    />
  );
}
