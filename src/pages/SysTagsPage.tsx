import React, { useMemo, useState } from "react";
import { Package, Eye, Trash2, Edit2, Network } from "lucide-react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { type DataTableColumn } from "@/shared/components/DataTable";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { useTags, useTagsMutations } from "@/modules/tags/hooks/useTags";
import { SysTag } from "@/modules/tags/api/tagsApi";
import { TagFormModal } from "@/modules/tags";
import { TagConnectionsDrawer } from "@/modules/tags/components/TagConnectionsDrawer";
import { useUIStore } from "@/core/config/uiStore";

export function SysTagsPage() {
  const { showToast } = useUIStore();
  const { data: tags = [], isLoading } = useTags();
  const { deleteTag } = useTagsMutations();

  const [formOpen, setFormOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "view" | "edit">(
    "create",
  );
  const [editingTag, setEditingTag] = useState<SysTag | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<SysTag | null>(null);

  const [viewingTag, setViewingTag] = useState<SysTag | null>(null);

  const columns = useMemo<DataTableColumn<SysTag>[]>(
    () => [
      {
        key: "name",
        header: "Tên thẻ",
        cell: (row) => (
          <div className="flex items-center gap-2">
            {row.color && (
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: row.color }}
              />
            )}
            <span className="font-medium text-[color:var(--color-primary-text)]">
              {row.name}
            </span>
          </div>
        ),
      },
      {
        key: "description",
        header: "Mô tả",
        cell: (row) => (
          <span className="text-[color:var(--color-secondary-text)] truncate max-w-md inline-block">
            {row.description || "-"}
          </span>
        ),
      },
      {
        key: "connectionCount",
        header: "Số liên kết",
        cell: (row) => (
          <div className="flex items-center gap-1 text-[color:var(--color-secondary-text)]">
            <Network className="w-3.5 h-3.5" />
            <span>{row.connectionCount || 0}</span>
          </div>
        ),
      },
    ],
    [],
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

  return (
    <>
      <SpreadsheetPageTemplate<SysTag>
        title="Quản lý thẻ (Tags)"
        icon={<Package className="w-5 h-5" />}
        tableId="sys-tags-table"
        items={tags}
        columns={columns}
        getRowKey={(item: SysTag) => item.id}
        loading={isLoading}
        emptyLabel="Không có thẻ nào"
        minWidth={760}
        page={1}
        pageSize={tags.length || 10}
        total={tags.length}
        totalPages={1}
        onPage={() => {}}
        onPageSize={() => {}}
        onRefresh={() => {}}
        onCreate={() => {
          setEditingTag(null);
          setDrawerMode("create");
          setFormOpen(true);
        }}
        createLabel="Thêm thẻ"
        rowActions={(row: SysTag) => [
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
          {
            label: "Chỉnh sửa",
            icon: <Edit2 className="w-3.5 h-3.5" />,
            onClick: () => {
              setEditingTag(row);
              setDrawerMode("edit");
              setFormOpen(true);
            },
          },
          {
            label: "Xóa",
            icon: <Trash2 className="w-3.5 h-3.5" />,
            variant: "danger",
            onClick: () => {
              setTagToDelete(row);
              setDeleteConfirmOpen(true);
            },
          },
        ]}
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
