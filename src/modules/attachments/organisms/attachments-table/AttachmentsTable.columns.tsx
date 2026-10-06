import React from "react";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { TableText } from "@/shared/components/DataTable/TableText";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { AttachmentTypeBadge } from "../../atoms/attachment-type-badge";
import { formatFileSize } from "../../molecules/attachment-detail-modal";
import {
  ATTACHMENT_TYPE_OPTIONS,
  ATTACHMENT_MODULE_LABELS,
  type ErpAttachment,
} from "../../types/attachment.types";
import {
  RelatedDocsCell,
  AttachmentsDateRangeSlot,
} from "./AttachmentsTableCells";
import type { useAttachmentsTable } from "./AttachmentsTable.hook";

export function getAttachmentsColumns(
  tableState: ReturnType<typeof useAttachmentsTable>,
  onSelect: (a: ErpAttachment) => void,
  onOpenInvoice?: (id: string) => void,
): DataTableColumn<ErpAttachment>[] {
  return [
    {
      key: "createdAt",
      header: (
        <TableColumnHeaderFilter
          title="Ngày tải"
          sortState={tableState.getSortState("createdAt")}
          onSortChange={(state) =>
            tableState.handleSortChange("createdAt", state)
          }
          searchValue=""
          onSearchChange={() => {}}
          selectedFilters={[]}
          onFilterChange={() => {}}
          hideFilter
          hideFooter
          align="center"
          isActive={!!(tableState.dateFrom || tableState.dateTo)}
          dateRangeSlot={({ close }) => (
            <AttachmentsDateRangeSlot tableState={tableState} close={close} />
          )}
        />
      ),
      cell: (a) => a.createdAt?.slice(0, 10) || "—",
      className: "text-[color:var(--muted-fg)] whitespace-nowrap text-center",
      headerClassName: "text-center",
      size: 130,
    },
    {
      key: "documentType",
      header: (
        <TableColumnHeaderFilter
          title="Loại"
          sortState={tableState.getSortState("documentType")}
          onSortChange={(state) =>
            tableState.handleSortChange("documentType", state)
          }
          searchValue=""
          onSearchChange={() => {}}
          filterOptions={ATTACHMENT_TYPE_OPTIONS}
          selectedFilters={tableState.typeFilter ? [tableState.typeFilter] : []}
          onFilterChange={(vals) => {
            tableState.setTypeFilter(vals.length ? vals[0] : "");
            tableState.setPage(1);
          }}
          align="center"
        />
      ),
      className: "text-center",
      headerClassName: "text-center",
      cell: (a) => (
        <div className="flex justify-center w-full">
          <AttachmentTypeBadge type={a.documentType} />
        </div>
      ),
      size: 140,
    },
    {
      key: "fileName",
      header: (
        <TableColumnHeaderFilter
          title="Tên file"
          sortState={tableState.getSortState("fileName")}
          onSortChange={(state) =>
            tableState.handleSortChange("fileName", state)
          }
          searchValue={tableState.colSearch["fileName"] || ""}
          onSearchChange={(v) =>
            tableState.setColSearch((p) => ({ ...p, fileName: v }))
          }
          selectedFilters={tableState.filters["fileName"] || []}
          onFilterChange={(vals) => {
            tableState.setFilters((p) => ({ ...p, fileName: vals }));
            tableState.setPage(1);
          }}
          align="center"
          columnKey="fileName"
          fetchOptions={tableState.fetchAttachmentOptions}
        />
      ),
      cell: (a) => (
        <TableText
          text={a.fileName}
          onDetailClick={() => onSelect(a)}
          tooltip
        />
      ),
      className: "max-w-[380px] truncate text-left font-medium",
      headerClassName: "text-center",
      size: 260,
    },
    {
      key: "module",
      header: (
        <TableColumnHeaderFilter
          title="Phân hệ"
          sortState={tableState.getSortState("module")}
          onSortChange={(state) => tableState.handleSortChange("module", state)}
          searchValue={tableState.colSearch["module"] || ""}
          onSearchChange={(v) =>
            tableState.setColSearch((p) => ({ ...p, module: v }))
          }
          selectedFilters={tableState.filters["module"] || []}
          onFilterChange={(vals) => {
            tableState.setFilters((p) => ({ ...p, module: vals }));
            tableState.setPage(1);
          }}
          align="center"
          columnKey="module"
          fetchOptions={tableState.fetchAttachmentOptions}
          formatOptionLabel={(lbl) => ATTACHMENT_MODULE_LABELS[lbl] ?? lbl}
        />
      ),
      cell: (a) => ATTACHMENT_MODULE_LABELS[a.module ?? ""] ?? a.module ?? "—",
      className: "text-center text-[color:var(--muted-fg)]",
      headerClassName: "text-center",
      size: 140,
    },
    {
      key: "relatedDocs",
      header: (
        <TableColumnHeaderFilter
          title="Chứng từ liên quan"
          sortState="none"
          onSortChange={() => {}}
          searchValue={tableState.colSearch["relatedDocs"] || ""}
          onSearchChange={(v) =>
            tableState.setColSearch((p) => ({ ...p, relatedDocs: v }))
          }
          selectedFilters={tableState.filters["relatedDocs"] || []}
          onFilterChange={(vals) => {
            tableState.setFilters((p) => ({ ...p, relatedDocs: vals }));
            tableState.setPage(1);
          }}
          columnKey="relatedDocs"
          fetchOptions={tableState.fetchAttachmentOptions}
          align="center"
        />
      ),
      cell: (a) => (
        <RelatedDocsCell attachment={a} onOpenInvoice={onOpenInvoice} />
      ),
      className: "text-left pl-4",
      headerClassName: "text-center",
      size: 180,
    },
    {
      key: "fileSize",
      header: (
        <TableColumnHeaderFilter
          title="Dung lượng"
          sortState={tableState.getSortState("fileSize")}
          onSortChange={(state) =>
            tableState.handleSortChange("fileSize", state)
          }
          searchValue={tableState.colSearch["fileSize"] || ""}
          onSearchChange={(v) =>
            tableState.setColSearch((p) => ({ ...p, fileSize: v }))
          }
          selectedFilters={tableState.filters["fileSize"] || []}
          onFilterChange={(vals) => {
            tableState.setFilters((p) => ({ ...p, fileSize: vals }));
            tableState.setPage(1);
          }}
          align="center"
        />
      ),
      cell: (a) => formatFileSize(a.fileSize),
      className: "text-[color:var(--muted-fg)] whitespace-nowrap text-center",
      headerClassName: "text-center",
      size: 120,
    },
  ];
}
