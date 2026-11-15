import * as React from "react";
import { ClipboardList, ShoppingCart } from "lucide-react";

import { V2Icon } from "@/v2/shared/components/atoms";
import { V2Dropdown, V2SplitButton } from "@/v2/shared/components";
import type { V2DropdownGroup } from "@/v2/shared/components";

/** Phần trạng thái danh sách mà nút hành động cần (tránh ràng buộc kiểu dòng của từng tab). */
interface ListActions {
  canCreate: boolean;
  openCreate: () => void;
}

interface Input {
  t: (key: string, fallback: string) => string;
  isOrders: boolean;
  requestsState: ListActions;
  ordersState: ListActions;
  workflow: { item: V2DropdownGroup["items"][number]; actionsLabel: string };
}

/**
 * Nút hành động của trang: nút chia đôi "Tạo đề nghị / Tạo đơn mua" kèm menu (tạo, xem sơ đồ quy trình).
 * Không có quyền tạo thì chỉ còn nút menu "Thao tác" chứa mục xem sơ đồ.
 */
export function useGarageProcurementPageActions({
  t,
  isOrders,
  requestsState,
  ordersState,
  workflow,
}: Input) {
  const actionDropdownGroups = React.useMemo<V2DropdownGroup[]>(
    () => [
      {
        items: [
          {
            id: "create-request",
            label: t(
              "v2.garageProcurementRequests.actionCreate",
              "Tạo đề nghị mua hàng",
            ),
            icon: <V2Icon icon={ClipboardList} size={15} />,
            onClick: requestsState.openCreate,
            disabled: !requestsState.canCreate,
          },
          {
            id: "create-order",
            label: t(
              "v2.garageProcurementOrders.actionCreate",
              "Tạo đơn mua hàng",
            ),
            icon: <V2Icon icon={ShoppingCart} size={15} />,
            onClick: ordersState.openCreate,
            disabled: !ordersState.canCreate,
          },
        ],
      },
      { items: [workflow.item] },
    ],
    [
      workflow.item,
      ordersState.canCreate,
      ordersState.openCreate,
      requestsState.canCreate,
      requestsState.openCreate,
      t,
    ],
  );

  const canCreateCurrent = isOrders
    ? ordersState.canCreate
    : requestsState.canCreate;

  const currentCreateAction = isOrders
    ? ordersState.openCreate
    : requestsState.openCreate;

  const currentActionLabel = isOrders
    ? t("v2.garageProcurementOrders.create", "Tạo đơn mua")
    : t("v2.garageProcurementRequests.create", "Tạo đề nghị");

  const currentIcon = isOrders ? (
    <V2Icon icon={ShoppingCart} size={16} />
  ) : (
    <V2Icon icon={ClipboardList} size={16} />
  );

  const actions = (
    <V2SplitButton
      label={canCreateCurrent ? currentActionLabel : workflow.actionsLabel}
      icon={canCreateCurrent ? currentIcon : undefined}
      onClick={canCreateCurrent ? currentCreateAction : undefined}
      renderMenu={(trigger) => (
        <V2Dropdown
          groups={actionDropdownGroups}
          trigger={trigger}
          align="end"
        />
      )}
    />
  );

  return { actions, icon: currentIcon };
}
