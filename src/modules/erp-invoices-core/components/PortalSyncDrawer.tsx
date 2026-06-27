import { useState } from "react";
import { RefreshCw, Settings, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { usePortalSync } from "../hooks/usePortalSync";

function TokenConfigDrawer({
  open,
  onClose,
  token,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  token: string;
  onSave: (t: string) => void;
}) {
  const [draft, setDraft] = useState(token);

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title="Cấu hình Portal GDT"
      panelClassName="min-[1024px]:w-[480px]"
      actions={[
        {
          label: "Đóng",
          onClick: onClose,
          variant: "outline" as const,
        },
        {
          label: "Lưu token",
          primary: true,
          onClick: () => {
            onSave(draft);
            onClose();
          },
        },
      ]}
    >
      <div className="space-y-4 p-1">
        <p className="text-sm text-muted-foreground">
          Nhập Bearer token đã đăng nhập vào hệ thống{" "}
          <span className="font-medium">hoadondientu.gdt.gov.vn</span>. Token
          được lưu trong trình duyệt và dùng để đồng bộ hóa đơn.
        </p>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Bearer Token
          </label>
          <textarea
            className="w-full h-32 rounded-md border border-border bg-surface px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            placeholder="eyJhbGciOiJ..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        </div>
        {draft && (
          <p className="text-xs text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Token đã nhập ({draft.length} ký tự)
          </p>
        )}
      </div>
    </DrawerModal>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSynced: (dir: "IN" | "OUT") => void;
  initialDirection: "IN" | "OUT";
}

export function PortalSyncDrawer({
  open,
  onClose,
  onSynced,
  initialDirection,
}: Props) {
  const portal = usePortalSync();
  const [configOpen, setConfigOpen] = useState(false);
  const [direction, setDirection] = useState<"IN" | "OUT">(initialDirection);

  const type = direction === "IN" ? "purchase" : "sold";

  const handleSync = async () => {
    const res = await portal.sync(type);
    if (res) onSynced(direction);
  };

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title="Đồng bộ Hóa đơn từ GDT"
      actions={[
        {
          label: "Đóng",
          onClick: onClose,
          variant: "outline",
        },
      ]}
    >
      <div className="space-y-6">
        <div className="flex gap-4 border-b border-border mb-4">
          <button
            type="button"
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              direction === "IN"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => {
              setDirection("IN");
              portal.clearResult();
            }}
          >
            Hóa đơn mua vào (IN)
          </button>
          <button
            type="button"
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              direction === "OUT"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => {
              setDirection("OUT");
              portal.clearResult();
            }}
          >
            Hóa đơn bán ra (OUT)
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <input
              type="date"
              value={portal.dateFrom}
              onChange={(e) => portal.setDateFrom(e.target.value)}
              className="h-9 rounded-md border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 flex-1"
            />
            <input
              type="date"
              value={portal.dateTo}
              onChange={(e) => portal.setDateTo(e.target.value)}
              className="h-9 rounded-md border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 flex-1"
            />
          </div>

          <div className="flex justify-between items-center mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfigOpen(true)}
              className="gap-1.5"
            >
              <Settings className="h-4 w-4" />
              Cấu hình token
            </Button>

            <Button
              onClick={handleSync}
              disabled={portal.loading}
              className="gap-2 w-32 justify-center"
            >
              <RefreshCw
                className={`h-4 w-4 ${portal.loading ? "animate-spin" : ""}`}
              />
              {portal.loading ? "Đang xử lý..." : "Bắt đầu đồng bộ"}
            </Button>
          </div>
        </div>

        {portal.result && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 space-y-1">
            <div className="font-semibold mb-2">Đồng bộ thành công</div>
            <div>
              • <span className="font-semibold">{portal.result.imported}</span>{" "}
              hóa đơn mới
            </div>
            <div>
              • Bỏ qua{" "}
              <span className="font-semibold">{portal.result.skipped}</span> hóa
              đơn trùng
            </div>
            <div>
              • Xếp hàng tải nền{" "}
              <span className="font-semibold">
                {portal.result.xmlDownloadQueued}
              </span>{" "}
              file XML
            </div>
            {portal.result.errors && portal.result.errors.length > 0 && (
              <div className="text-red-600 flex items-center gap-1 mt-2">
                <XCircle className="h-4 w-4" />
                {portal.result.errors.length} lỗi
              </div>
            )}
          </div>
        )}
      </div>

      <TokenConfigDrawer
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        token={portal.token}
        onSave={portal.setToken}
      />
    </DrawerModal>
  );
}
