import { useEffect, useState } from "react";
import {
  getPaymentVoucherTimelineApi,
  type PaymentVoucherTimelineLog,
} from "@/modules/finance/api/financeApi";

const ACTION_LABELS: Record<string, string> = {
  CREATE: "Tạo phiếu",
  UPDATE: "Cập nhật",
  DELETE: "Xóa mềm",
  SUBMITTED: "Gửi duyệt",
  APPROVED: "Duyệt",
  REJECTED: "Từ chối",
  CANCELLED: "Hủy",
  POST_TO_JOURNAL: "Ghi sổ",
  POST: "Ghi sổ",
  APPROVE: "Duyệt",
  REJECT: "Từ chối",
  CANCEL: "Hủy",
};

const ACTION_STYLES: Record<string, { dot: string; text: string; bg: string }> =
  {
    CREATE: {
      dot: "#3b82f6",
      text: "text-blue-700",
      bg: "bg-blue-50 border-blue-100",
    },
    UPDATE: {
      dot: "#0ea5e9",
      text: "text-sky-700",
      bg: "bg-sky-50 border-sky-100",
    },
    DELETE: {
      dot: "#6b7280",
      text: "text-gray-700",
      bg: "bg-gray-50 border-gray-100",
    },
    SUBMITTED: {
      dot: "#3b82f6",
      text: "text-blue-700",
      bg: "bg-blue-50 border-blue-100",
    },
    APPROVED: {
      dot: "#10b981",
      text: "text-emerald-700",
      bg: "bg-emerald-50 border-emerald-100",
    },
    REJECTED: {
      dot: "#ef4444",
      text: "text-red-700",
      bg: "bg-red-50 border-red-100",
    },
    CANCELLED: {
      dot: "#9ca3af",
      text: "text-gray-600",
      bg: "bg-gray-50 border-gray-100",
    },
    POST_TO_JOURNAL: {
      dot: "#8b5cf6",
      text: "text-violet-700",
      bg: "bg-violet-50 border-violet-100",
    },
  };

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Bản nháp",
  PENDING_APPROVAL: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  POSTED: "Đã ghi sổ",
  REJECTED: "Từ chối",
  CANCELLED: "Đã hủy",
};

interface ApprovalHistoryProps {
  voucherId: string;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function ApprovalHistory({ voucherId }: ApprovalHistoryProps) {
  const [logs, setLogs] = useState<PaymentVoucherTimelineLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPaymentVoucherTimelineApi(voucherId);
        if (!active) return;
        const sorted = [...data].sort(
          (a, b) =>
            new Date(a.action_at).getTime() - new Date(b.action_at).getTime(),
        );
        setLogs(sorted);
      } catch (err: any) {
        if (!active) return;
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Không tải được lịch sử duyệt",
        );
        setLogs([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [voucherId]);

  if (loading) {
    return (
      <div className="text-xs text-muted-fg py-2 animate-pulse">
        Đang tải lịch sử duyệt...
      </div>
    );
  }

  if (error) {
    return <div className="text-xs text-red-600 py-2">{error}</div>;
  }

  if (!logs.length) {
    return <div className="text-xs text-muted-fg py-2">Chưa có audit log.</div>;
  }

  return (
    <div className="relative">
      {logs.map((log, idx) => {
        const style = ACTION_STYLES[log.action] ?? {
          dot: "#9ca3af",
          text: "text-gray-600",
          bg: "bg-gray-50 border-gray-100",
        };
        const isLast = idx === logs.length - 1;
        const actorLabel =
          log.actor_name || log.actor_email || log.actor_id || "Hệ thống";

        return (
          <div key={log.id} className="flex gap-0">
            <div className="flex flex-col items-center w-[18px] flex-shrink-0">
              <div
                className="w-[9px] h-[9px] rounded-full flex-shrink-0 mt-[5px]"
                style={{ backgroundColor: style.dot }}
              />
              {!isLast && (
                <div className="w-[1.5px] flex-1 bg-[color:var(--border)] my-[2px]" />
              )}
            </div>

            <div className={`flex-1 min-w-0 ${isLast ? "pb-0" : "pb-3"}`}>
              <div className={`rounded-lg border px-2.5 py-2 ${style.bg}`}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[11px] font-bold ${style.text}`}>
                    {ACTION_LABELS[log.action] ??
                      log.action_label ??
                      log.action}
                  </span>
                  {log.from_status && log.to_status && (
                    <span className="text-[10px] text-muted-fg">
                      {STATUS_LABELS[log.from_status] ?? log.from_status} →{" "}
                      {STATUS_LABELS[log.to_status] ?? log.to_status}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-fg flex-wrap">
                  <span className="font-medium text-foreground/70">
                    {formatTime(log.action_at)}
                  </span>
                  <span>{formatDate(log.action_at)}</span>
                  <span className="mx-0.5">·</span>
                  <span className="truncate">{actorLabel}</span>
                  {!!log.entity_no && (
                    <>
                      <span className="mx-0.5">·</span>
                      <span className="truncate">{log.entity_no}</span>
                    </>
                  )}
                </div>

                {log.note && (
                  <div className="mt-1.5 text-[11px] text-foreground/80 italic">
                    "{log.note}"
                  </div>
                )}

                {log.reason && (
                  <div className="mt-1 text-[11px] text-red-700">
                    Lý do: {log.reason}
                  </div>
                )}

                {!!log.changed_fields?.length && (
                  <div className="mt-1 text-[10px] text-muted-fg">
                    Trường đổi: {log.changed_fields.join(", ")}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
