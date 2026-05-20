import { useEffect, useState } from "react";
import {
  getVoucherApprovalLogsApi,
  type PaymentVoucherApprovalLog,
} from "@/modules/finance/api/financeApi";

const ACTION_LABELS: Record<string, string> = {
  SUBMIT: "Gửi duyệt",
  APPROVE: "Duyệt",
  REJECT: "Từ chối",
  POST: "Ghi nhận bút toán",
  CANCEL: "Hủy",
};

const ACTION_STYLES: Record<string, { dot: string; text: string; bg: string }> =
  {
    SUBMIT: {
      dot: "#3b82f6",
      text: "text-blue-700",
      bg: "bg-blue-50 border-blue-100",
    },
    APPROVE: {
      dot: "#10b981",
      text: "text-emerald-700",
      bg: "bg-emerald-50 border-emerald-100",
    },
    REJECT: {
      dot: "#ef4444",
      text: "text-red-700",
      bg: "bg-red-50 border-red-100",
    },
    POST: {
      dot: "#8b5cf6",
      text: "text-violet-700",
      bg: "bg-violet-50 border-violet-100",
    },
    CANCEL: {
      dot: "#9ca3af",
      text: "text-gray-600",
      bg: "bg-gray-50 border-gray-100",
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
  const [logs, setLogs] = useState<PaymentVoucherApprovalLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getVoucherApprovalLogsApi(voucherId)
      .then((data) => {
        const sorted = [...data].sort(
          (a, b) =>
            new Date(a.action_at).getTime() - new Date(b.action_at).getTime(),
        );
        setLogs(sorted);
      })
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [voucherId]);

  if (loading) {
    return (
      <div className="text-xs text-muted-fg py-2 animate-pulse">
        Đang tải lịch sử duyệt...
      </div>
    );
  }

  if (!logs.length) {
    return (
      <div className="text-xs text-muted-fg py-2">Chưa có hoạt động duyệt.</div>
    );
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

        return (
          <div key={log.id} className="flex gap-0">
            {/* Timeline column */}
            <div className="flex flex-col items-center w-[18px] flex-shrink-0">
              {/* Dot */}
              <div
                className="w-[9px] h-[9px] rounded-full flex-shrink-0 mt-[5px]"
                style={{ backgroundColor: style.dot }}
              />
              {/* Connector */}
              {!isLast && (
                <div className="w-[1.5px] flex-1 bg-[color:var(--border)] my-[2px]" />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 min-w-0 ${isLast ? "pb-0" : "pb-3"}`}>
              {/* Card-like row */}
              <div className={`rounded-lg border px-2.5 py-2 ${style.bg}`}>
                {/* Top: action + status transition */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[11px] font-bold ${style.text}`}>
                    {ACTION_LABELS[log.action] ?? log.action}
                  </span>
                  {log.from_status && log.to_status && (
                    <span className="text-[10px] text-muted-fg">
                      {STATUS_LABELS[log.from_status] ?? log.from_status} →{" "}
                      {STATUS_LABELS[log.to_status] ?? log.to_status}
                    </span>
                  )}
                </div>

                {/* Time + date + actor */}
                <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-fg">
                  <span className="font-medium text-foreground/70">
                    {formatTime(log.action_at)}
                  </span>
                  <span>{formatDate(log.action_at)}</span>
                  {(log.action_by_name || log.action_by) && (
                    <>
                      <span className="mx-0.5">·</span>
                      <span className="truncate">
                        {log.action_by_name ||
                          (log.action_by?.length === 36
                            ? "Hệ thống"
                            : log.action_by)}
                      </span>
                    </>
                  )}
                </div>

                {/* Note */}
                {log.note && (
                  <div className="mt-1.5 text-[11px] text-foreground/80 italic">
                    "{log.note}"
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
