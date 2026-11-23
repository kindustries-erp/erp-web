import * as React from "react";
import { Ban, CheckCheck, FileCheck, Lock, Send, Undo2 } from "lucide-react";
import type { V2RowAction } from "@/v2/shared/types/v2-table";
import { CREATOR_ONLY_ACTION_REASON } from "../procurement.creator";
import type { ProcurementActionKey } from "../procurement.rules";
import type { ProcurementListConfig } from "./procurementListConfig.type";

type TFn = (key: string, fallback: string) => string;

const ICON_CLASS = "h-3.5 w-3.5";

const ACTION_ICONS: Record<ProcurementActionKey, React.ReactNode> = {
  submit: <Send className={ICON_CLASS} />,
  recall: <Undo2 className={ICON_CLASS} />,
  approve: <CheckCheck className={ICON_CLASS} />,
  reject: <Ban className={ICON_CLASS} />,
  issue: <FileCheck className={ICON_CLASS} />,
  cancel: <Ban className={ICON_CLASS} />,
  close: <Lock className={ICON_CLASS} />,
};

const isDangerAction = (action: ProcurementActionKey) =>
  action === "cancel" || action === "reject";

export interface BuildTransitionItemsInput<T extends { id: string }> {
  t: TFn;
  config: ProcurementListConfig<T>;
  row: T;
  /** Người đăng nhập có phải người tạo chứng từ (chỉ ảnh hưởng hành động còn trong CREATOR_ONLY_ACTION_REASON) */
  isCreator: boolean;
  canUpdate: boolean;
  start: (row: T, action: ProcurementActionKey) => void;
}

/** Hành động chuyển trạng thái của một dòng, tách thành nhóm thường và nguy hiểm (giữ thứ tự). */
export function buildTransitionItems<T extends { id: string }>({
  t,
  config,
  row,
  isCreator,
  canUpdate,
  start,
}: BuildTransitionItemsInput<T>): {
  normal: V2RowAction[];
  danger: V2RowAction[];
} {
  const transitions: V2RowAction[] = canUpdate
    ? config.availableActions(row).map((action) => {
        const creatorOnly = CREATOR_ONLY_ACTION_REASON[action];
        const disabled = Boolean(creatorOnly) && !isCreator;

        return {
          label: t(`v2.procurement.actions.${action}`, action),
          icon: ACTION_ICONS[action],
          disabled,
          disabledReason:
            disabled && creatorOnly
              ? t(creatorOnly.key, creatorOnly.fallback)
              : undefined,
          hint:
            action === "issue"
              ? t(
                  "v2.procurement.actions.issueHint",
                  "Chốt đơn đã duyệt và gửi cho nhà cung cấp",
                )
              : undefined,
          onClick: () => start(row, action),
          variant: isDangerAction(action)
            ? ("danger" as const)
            : ("default" as const),
        };
      })
    : [];
  return {
    normal: transitions.filter((a) => a.variant !== "danger"),
    danger: transitions.filter((a) => a.variant === "danger"),
  };
}
