import { useEffect, useState } from "react";
import {
  getVoucherApprovalLogsApi,
  type PaymentVoucherApprovalLog,
} from "@/modules/finance/api/financeApi";

const ACTION_LABELS: Record<string, string> = {
  SUBMIT: "Gửi duyệt",
  APPROVE: "Duyệt",
  REJECT: "Từ chối",
  POST: "Hạch toán",
  CANCEL: "Hủy",
};

const ACTION_COLORS: Record<string, string> = {
  SUBMIT: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  APPROVE: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  REJECT: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  POST: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  CANCEL: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

interface ApprovalHistoryProps {
  voucherId: string;
}

export function ApprovalHistory({ voucherId }: ApprovalHistoryProps) {
  const [logs, setLogs] = useState<PaymentVoucherApprovalLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getVoucherApprovalLogsApi(voucherId)
      .then(setLogs)
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [voucherId]);

  if (loading) {
    return (
      <div className="text-xs text-muted-fg py-2 px-1 animate-pulse">
        Đang tải lịch sử duyệt...
      </div>
    );
  }

  if (!logs.length) {
    return (
      <div className="text-xs text-muted-fg py-2 px-1">
        Chưa có hoạt động duyệt.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <div
          key={log.id}
          className="flex items-start gap-3 text-xs border-l-2 border-border pl-3"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-1.5 py-[1px] rounded text-[10px] font-medium ${
                  ACTION_COLORS[log.action] ?? "bg-muted text-muted-fg"
                }`}
              >
                {ACTION_LABELS[log.action] ?? log.action}
              </span>
              {log.from_status && log.to_status && (
                <span className="text-muted-fg">
                  {log.from_status} → {log.to_status}
                </span>
              )}
            </div>
            <div className="text-muted-fg mt-0.5">
              {new Date(log.action_at).toLocaleString("vi-VN")}
              {log.action_by && ` · ${log.action_by}`}
            </div>
            {log.note && (
              <div className="mt-0.5 text-foreground italic">"{log.note}"</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
