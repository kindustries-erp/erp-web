import React, { useMemo, useState, useCallback } from "react";
import { Package, Eye, Trash2, Pencil, Network, Plus } from "lucide-react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import {
  createColumnHeaderFilter,
  filterClientItems,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { TableText } from "@/shared/components/DataTable/TableText";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { useTags, useTagsMutations } from "@/modules/tags/hooks/useTags";
import { SysTag } from "@/modules/tags/api/tagsApi";
import { TagFormModal } from "@/modules/tags";
import { TagConnectionsDrawer } from "@/modules/tags/components/TagConnectionsDrawer";
import { useUIStore } from "@/core/config/uiStore";
import { Badge } from "@/shared/components/ui/badge";

export function SysTagsPage() {
  const { showToast } = useUIStore();
  const { data: tags = [], isLoading, refetch } = useTags();
  const { deleteTag } = useTagsMutations();

  const [formOpen, setFormOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "view" | "edit">(
    "create",
  );
  const [editingTag, setEditingTag] = useState<SysTag | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<SysTag | null>(null);

  const [viewingTag, setViewingTag] = useState<SysTag | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const tableState = useTableColumnState("sys-tags-table");

  const filteredItems = useMemo(() => {
    return filterClientItems(tags, tableState);
  }, [tags, tableState]);

  const total = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, page, pageSize]);

  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: tableState,
        items: tags,
      }),
    [tableState, tags],
  );

  const columns = useMemo<DataTableColumn<SysTag>[]>(
    () => [
      // 1. STT (40px, 1-based, căn giữa)
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        minSize: 40,
        maxSize: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className:
          "text-center w-[40px] min-w-[40px] font-mono text-xs text-muted-foreground",
        cell: (_, idx) => (
          <span className="w-full block text-center">{idx}</span>
        ),
      },

      // 2. Tên thẻ
      {
        key: "name",
        header: headerFilter("name", "Tên thẻ", { showBlankOption: true }),
        size: 200,
        minSize: 150,
        enableResizing: true,
        cell: (row) => (
          <Badge
            variant="outline"
            className="gap-1 px-2 py-0 min-h-[20px] h-[20px] rounded-full text-[11px] leading-none select-text"
            style={{
              backgroundColor: row.color
                ? `${row.color}15`
                : "var(--color-surface)",
              color: row.color || "var(--color-primary-text)",
              borderColor: row.color ? `${row.color}30` : "var(--color-border)",
            }}
          >
            {row.name}
          </Badge>
        ),
      },

      // 3. Mô tả
      {
        key: "description",
        header: headerFilter("description", "Mô tả", {
          showBlankOption: true,
        }),
        size: 360,
        minSize: 220,
        enableResizing: true,
        cell: (row) => (
          <TableText
            text={row.description || "—"}
            tooltip={true}
            textClassName="truncate text-xs text-muted-foreground select-text"
          />
        ),
      },

      // 4. Số liên kết
      {
        key: "connectionCount",
        header: headerFilter.qty("connectionCount", "Số liên kết"),
        size: 130,
        minSize: 110,
        enableResizing: true,
        className: "text-center",
        cell: (row) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setViewingTag(row);
            }}
            className="inline-flex items-center justify-center gap-1.5 px-2 py-0 h-[20px] rounded-full bg-slate-100/90 hover:bg-slate-200/90 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 text-foreground transition-all duration-150 cursor-pointer group shadow-xs hover:scale-105"
          >
            <Network className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            <span className="tabular-nums font-mono font-semibold text-xs text-foreground">
              {row.connectionCount || 0}
            </span>
          </button>
        ),
      },
    ],
    [headerFilter],
  );

  const handleDelete = async () => {
    if (!tagToDelete) return;
    try {
      await deleteTag(tagToDelete.id);
      showToast({
        title: "Thành công",
        description: "Đã xóa thẻ",
        variant: "success",
      });
      setDeleteConfirmOpen(false);
      setTagToDelete(null);
    } catch (err) {
      const error = err as Error;
      showToast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const rowActions = useCallback(
    (row: SysTag) => [
      {
        groupLabel: "Tra cứu",
        items: [
          {
            label: "Chi tiết",
            icon: <Eye className="w-3.5 h-3.5" />,
            onClick: () => {
              setEditingTag(row);
              setDrawerMode("view");
              setFormOpen(true);
            },
          },
          {
            label: "Xem liên kết",
            icon: <Network className="w-3.5 h-3.5" />,
            onClick: () => {
              setViewingTag(row);
            },
          },
        ],
      },
      {
        groupLabel: "Thao tác",
        items: [
          {
            label: "Chỉnh sửa",
            icon: <Pencil className="w-3.5 h-3.5" />,
            onClick: () => {
              setEditingTag(row);
              setDrawerMode("edit");
              setFormOpen(true);
            },
          },
          {
            label: "Xóa",
            icon: <Trash2 className="w-3.5 h-3.5" />,
            variant: "danger" as const,
            onClick: () => {
              setTagToDelete(row);
              setDeleteConfirmOpen(true);
            },
          },
        ],
      },
    ],
    [],
  );

  return (
    <>
      <SpreadsheetPageTemplate<SysTag>
        title="Quản lý thẻ (Tags)"
        desc="Quản lý danh mục thẻ nhãn gắn cho các chứng từ và thực thể hệ thống"
        icon={<Package className="w-5 h-5" />}
        tableId="sys-tags-table"
        items={paginatedItems}
        columns={columns}
        getRowKey={(item: SysTag) => item.id}
        loading={isLoading}
        emptyLabel="Không có thẻ nào"
        minWidth={760}
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPage={(p) => setPage(p)}
        onPageSize={(s) => {
          setPageSize(s);
          setPage(1);
        }}
        activeFilterCount={tableState.activeFilterCount}
        onClearAllFilters={tableState.resetFilters}
        onRefresh={() => refetch()}
        createActions={[
          {
            label: "Thêm thẻ",
            icon: <Plus className="w-4 h-4 text-emerald-600" />,
            onClick: () => {
              setEditingTag(null);
              setDrawerMode("create");
              setFormOpen(true);
            },
          },
        ]}
        rowActions={rowActions}
      />

      {formOpen && (
        <TagFormModal
          tag={editingTag}
          initialMode={drawerMode}
          onClose={() => setFormOpen(false)}
        />
      )}

      {viewingTag && (
        <TagConnectionsDrawer
          open={!!viewingTag}
          onClose={() => setViewingTag(null)}
          tagId={viewingTag.id}
          tagName={viewingTag.name}
          tagColor={viewingTag.color}
        />
      )}

      {deleteConfirmOpen && (
        <ConfirmModal
          open={deleteConfirmOpen}
          title="Xóa thẻ"
          message={`Bạn có chắc chắn muốn xóa thẻ "${tagToDelete?.name}"?`}
          confirmLabel="Xóa"
          cancelLabel="Hủy"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirmOpen(false)}
        />
      )}
    </>
  );
}
