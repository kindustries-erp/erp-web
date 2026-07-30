import { useState, useEffect } from "react";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { SearchInput } from "@/shared/components/SearchInput";
import { Combobox } from "@/shared/components/Combobox";
import { getAttachmentsPagedApi, type ErpAttachment } from "@/modules/system/api/attachmentsApi";
import { Button } from "@/shared/components/ui/Button";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (attachment: ErpAttachment) => void;
}

const TYPE_OPTS = [
  { value: "HOP_DONG", label: "Hợp đồng" },
  { value: "HOA_DON", label: "Hóa đơn" },
  { value: "BANG_KE", label: "Bảng kê" },
  { value: "KHAC", label: "Khác" },
];

export function ErpAttachmentSelectDrawer({ open, onClose, onSelect }: Props) {
  const [items, setItems] = useState<ErpAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | "">("");

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, search, typeFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAttachmentsPagedApi({
        page: 1,
        pageSize: 50,
        search: search || undefined,
        documentType: typeFilter || undefined,
        sort: ["-createdAt"],
      });
      setItems(res.items);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title="Tìm tài liệu có sẵn"
      panelClassName="w-[600px]"
    >
      <div className="flex flex-col gap-4 h-[calc(100vh-120px)]">
        <div className="flex gap-2">
          <SearchInput
            placeholder="Tìm tên file..."
            value={search}
            onChange={setSearch}
            className="flex-1"
          />
          <Combobox
            options={TYPE_OPTS}
            value={typeFilter}
            onChange={(v) => setTypeFilter(v as string)}
            placeholder="Tất cả loại"
            className="w-[180px]"
          />
        </div>
        
        <div className="flex-1 overflow-y-auto border rounded-md">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground text-sm">Đang tải...</div>
          ) : items.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">Không tìm thấy tài liệu nào</div>
          ) : (
            <div className="flex flex-col divide-y">
              {items.map(item => (
                <div key={item.id} className="p-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col overflow-hidden pr-4">
                    <div className="font-medium text-sm truncate" title={item.fileName}>{item.fileName}</div>
                    <div className="text-xs text-muted-foreground flex gap-2 mt-1">
                      <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-sm">
                        {TYPE_OPTS.find(t => t.value === item.documentType)?.label || item.documentType}
                      </span>
                      <span>{item.createdAt.slice(0, 10)}</span>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => onSelect(item)}>Chọn</Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DrawerModal>
  );
}
