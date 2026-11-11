import * as React from "react";
import {
  Ban,
  CheckCheck,
  Copy,
  Eye,
  FileCheck,
  Lock,
  PackageCheck,
  Pencil,
  Send,
  ShoppingCart,
  Trash2,
  Undo2,
} from "lucide-react";
import type { V2RowAction, V2RowActionGroup } from "@/v2/shared/types/v2-table";
import type { ProcurementActionKey } from "../procurement.rules";
import type { ProcurementListConfig } from "./procurementListConfig.type";

type TFn = (key: string, fallback: string) => string;

const ICON_CLASS = "h-3.5 w-3.5";

/** Trạng thái được phép nhân bản (khớp API: từ chối hoặc hủy) */
const CLONABLE_STATUSES = ["REJECTED", "CANCELLED"];

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

export interface BuildProcurementRowActionsInput<T extends { id: string }> {
  t: TFn;
  config: ProcurementListConfig<T>;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  currentUserId?: string | null;
  currentUserEmail?: string | null;
  /** Mở drawer của một chứng từ ở chế độ xem hoặc sửa */
  openDrawer: (id: string, mode: "view" | "edit") => void;
  /** Mở modal lý do hoặc xác nhận cho một hành động chuyển trạng thái */
  start: (row: T, action: ProcurementActionKey) => void;
  /** Mở modal xóa nháp */
  openDelete: (row: T) => void;
  /** Chuyển sang lập PO từ PR */
  orderFromRequest: (row: T) => void;
  /** Nhân bản phiếu đã từ chối/hủy thành nháp mới */
  cloneRow?: (row: T) => void;
  /** Quyền nhập kho (tạo phiếu nhập) và hành động mở trang nhập kho từ đơn mua */
  canReceive?: boolean;
  receive?: (row: T) => void;
}

/**
 * Dựng menu chuột phải theo dòng, dùng chung cho mọi họ procurement.
 * Nhóm 1 TRA CỨU chỉ có "Xem chi tiết". Nhóm 2 THAO TÁC có Chỉnh sửa đứng đầu
 * để nút nhanh khi hover là Xem + Chỉnh sửa; chuyển trạng thái thường đứng trước
 * các hành động nguy hiểm; Xóa và Xóa vĩnh viễn đứng cuối.
 */
export function buildProcurementRowActions<T extends { id: string }>(
  input: BuildProcurementRowActionsInput<T>,
) {
  const {
    t,
    config,
    canCreate,
    canUpdate,
    canDelete,
    currentUserId,
    currentUserEmail,
    openDrawer,
    start,
    openDelete,
    orderFromRequest,
    cloneRow,
    canReceive: canReceiveGoods = false,
    receive,
  } = input;

  return (row: T): V2RowActionGroup[] => {
    const lookup: V2RowAction = {
      label: t("v2.procurement.actions.view", "Xem chi tiết"),
      icon: <Eye className={ICON_CLASS} />,
      onClick: () => openDrawer(row.id, "view"),
    };

    // Luôn hiện Chỉnh sửa khi có quyền (khớp bảng hóa đơn); không phải nháp thì mờ kèm lý do
    const editable = config.isEditable(row);
    const edit: V2RowAction[] = canUpdate
      ? [
          {
            label: t("v2.procurement.actions.edit", "Chỉnh sửa"),
            icon: <Pencil className={ICON_CLASS} />,
            disabled: !editable,
            disabledReason: t(
              "v2.procurement.actions.editDisabledReason",
              "Chỉ sửa được khi còn nháp",
            ),
            onClick: () => openDrawer(row.id, "edit"),
          },
        ]
      : [];

    // Luôn hiện khi là PR có quyền tạo; không lập được thì mờ kèm lý do (tooltip)
    const orderBlockedKey = config.orderFromRequestBlockedKey?.(row) ?? null;
    const orderAllowed = config.canOrderFromRequest?.(row) ?? false;
    const fromRequest: V2RowAction[] =
      canCreate && config.poHref && config.canOrderFromRequest
        ? [
            {
              label: t(
                "v2.procurement.actions.createOrder",
                "Lập đơn mua từ đề nghị này",
              ),
              icon: <ShoppingCart className={ICON_CLASS} />,
              disabled: !orderAllowed,
              disabledReason: orderAllowed
                ? undefined
                : orderBlockedKey === "fullyOrdered"
                  ? t(
                      "v2.procurement.actions.orderFullyOrderedReason",
                      "Đề nghị đã được lập đủ đơn mua",
                    )
                  : t(
                      "v2.procurement.actions.orderNotApprovedReason",
                      "Chỉ lập đơn mua khi đề nghị đã duyệt",
                    ),
              onClick: () => orderFromRequest(row),
            },
          ]
        : [];

    // PO: "Nhập kho" mở trang nhập kho với đơn đã chọn; không đủ điều kiện thì mờ kèm lý do
    const receiveAllowed = config.canReceive?.(row) ?? false;
    const receiveBlockedKey = config.receiveBlockedKey?.(row) ?? null;
    const receiveItems: V2RowAction[] =
      canReceiveGoods && receive && config.receiveHref && config.canReceive
        ? [
            {
              label: t("v2.procurement.actions.receive", "Nhập kho"),
              icon: <PackageCheck className={ICON_CLASS} />,
              disabled: !receiveAllowed,
              disabledReason: receiveAllowed
                ? undefined
                : receiveBlockedKey === "fullyReceived"
                  ? t(
                      "v2.procurement.actions.receiveFullReason",
                      "Đơn mua đã nhận đủ hàng",
                    )
                  : t(
                      "v2.procurement.actions.receiveNotIssuedReason",
                      "Chỉ nhập kho khi đơn mua đã phát hành",
                    ),
              onClick: () => receive(row),
            },
          ]
        : [];

    const transitions: V2RowAction[] = canUpdate
      ? config.availableActions(row).map((action) => {
          let disabled = false;
          let disabledReason: string | undefined;

          if (action === "submit") {
            const r = row as {
              createdBy?: string | null;
              createdByEmail?: string | null;
            };
            const hasCreatorInfo = Boolean(r.createdBy || r.createdByEmail);
            const idMatch = Boolean(
              r.createdBy && currentUserId && r.createdBy === currentUserId,
            );
            const emailMatch = Boolean(
              r.createdByEmail &&
              currentUserEmail &&
              r.createdByEmail.toLowerCase() === currentUserEmail.toLowerCase(),
            );
            const isCreator = !hasCreatorInfo || idMatch || emailMatch;

            if (!isCreator) {
              disabled = true;
              disabledReason = t(
                "v2.procurement.actions.submitNotCreatorReason",
                "Chỉ người tạo mới được gửi duyệt",
              );
            }
          }

          return {
            label: t(`v2.procurement.actions.${action}`, action),
            icon: ACTION_ICONS[action],
            disabled,
            disabledReason,
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
    const normalTransitions = transitions.filter((a) => a.variant !== "danger");
    const dangerTransitions = transitions.filter((a) => a.variant === "danger");

    const deletable: V2RowAction[] =
      canDelete && config.api.remove && config.isEditable(row)
        ? [
            {
              label: t("v2.procurement.actions.delete", "Xóa"),
              icon: <Trash2 className={ICON_CLASS} />,
              onClick: () => openDelete(row),
              variant: "danger",
            },
          ]
        : [];

    // Nhân bản: chỉ phiếu đã từ chối/hủy, cần quyền tạo
    const rowStatus = (row as unknown as { status?: string }).status ?? "";
    const clonable: V2RowAction[] =
      canCreate &&
      config.cloneable &&
      cloneRow &&
      CLONABLE_STATUSES.includes(rowStatus)
        ? [
            {
              label: t("v2.procurement.actions.clone", "Nhân bản"),
              icon: <Copy className={ICON_CLASS} />,
              onClick: () => cloneRow(row),
            },
          ]
        : [];

    const operate: V2RowAction[] = [
      ...edit,
      ...clonable,
      ...fromRequest,
      ...receiveItems,
      ...normalTransitions,
      ...dangerTransitions,
      ...deletable,
    ];

    return [
      {
        groupLabel: t("v2.procurement.actionGroups.lookup", "Tra cứu"),
        items: [lookup],
      },
      ...(operate.length
        ? [
            {
              groupLabel: t("v2.procurement.actionGroups.operate", "Thao tác"),
              items: operate,
            },
          ]
        : []),
    ];
  };
}
