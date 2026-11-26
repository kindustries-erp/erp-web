import React from "react";
import type { GarageCaseDetailRow } from "@/modules/garage/components/organisms/garage-cases-detail-drawer/components/GarageCasesTableTab.type";
import type { V2KanbanLaneData } from "@/v2/shared/components/organisms/v2-kanban-board";
import { money } from "@/shared/utils/format";
import {
  GARAGE_KANBAN_LANES,
  kgaraCodeToLane,
  statusToLane,
} from "./garageCaseKanban.config";
import type {
  GarageCaseV2InfoMap,
  GarageKanbanLaneKey,
  GarageVehicleKanbanItem,
} from "./garageCaseKanban.type";

/**
 * Cột của một phiếu: ưu tiên `status` v2 (kể cả khi đã sửa đè), thiếu thì theo mã KGara của chính phiếu.
 * Không đoán theo text trạng thái.
 */
export function determineCaseLane(
  c: GarageCaseDetailRow,
  v2Info?: GarageCaseV2InfoMap,
): GarageKanbanLaneKey {
  const info = v2Info?.[c.id];
  return info ? statusToLane(info.status) : kgaraCodeToLane(c.tinhTrangDichVu);
}

export function groupCasesByVehicle(
  cases: GarageCaseDetailRow[],
  v2Info?: GarageCaseV2InfoMap,
): GarageVehicleKanbanItem[] {
  const groupMap = new Map<string, GarageVehicleKanbanItem>();

  for (const c of cases) {
    const rawPlate = (c.bienSoXe || "").trim().toUpperCase();
    const plate = rawPlate || c.soChungTu || c.id;
    const caseLane = determineCaseLane(c, v2Info);
    const groupKey = `${plate}::${caseLane}`;
    const info = v2Info?.[c.id];

    if (!groupMap.has(groupKey)) {
      groupMap.set(groupKey, {
        id: groupKey,
        licensePlate: rawPlate || c.soChungTu || "—",
        customerName: c.khachHangName || "—",
        customerCode: c.khachHangCode,
        voucherCustomerName: c.tenKhachHang ?? null,
        brandName: c.hangXeName || null,
        modelName: c.dongXeName || null,
        modelYear: c.namSanXuat || null,
        chassisNumber: c.soKhung || null,
        laneKey: caseLane,
        caseCount: 1,
        cases: [c],
        totalBilled: c.billed || 0,
        totalPaid: c.paid || 0,
        totalRemaining: c.remaining || 0,
        totalCost: c.cost || 0,
        totalProfit: c.profit || 0,
        latestDate: c.ngayHoanThanh,
        latestCaseCode: c.soChungTu,
        latestStatus: c.serviceStatus,
        progressStage: info?.progressStage ?? null,
        statusOverridden: Boolean(info?.statusOverridden),
      });
    } else {
      const item = groupMap.get(groupKey)!;
      item.caseCount += 1;
      item.cases.push(c);
      item.totalBilled += c.billed || 0;
      item.totalPaid += c.paid || 0;
      item.totalRemaining += c.remaining || 0;
      item.totalCost += c.cost || 0;
      item.totalProfit += c.profit || 0;

      if (!item.brandName && c.hangXeName) item.brandName = c.hangXeName;
      if (!item.modelName && c.dongXeName) item.modelName = c.dongXeName;
      if (!item.modelYear && c.namSanXuat) item.modelYear = c.namSanXuat;
      if (!item.chassisNumber && c.soKhung) item.chassisNumber = c.soKhung;
      if (c.tenKhachHang && !item.voucherCustomerName) {
        item.voucherCustomerName = c.tenKhachHang;
      }
      if (c.khachHangName && item.customerName === "—") {
        item.customerName = c.khachHangName;
      }
      if (c.soChungTu) {
        item.latestCaseCode = c.soChungTu;
      }
      if (c.ngayHoanThanh) {
        item.latestDate = c.ngayHoanThanh;
      }
      if (!item.progressStage && info?.progressStage) {
        item.progressStage = info.progressStage;
      }
      if (info?.statusOverridden) item.statusOverridden = true;
    }
  }

  return Array.from(groupMap.values());
}

export function buildGarageKanbanLanes(
  items: GarageVehicleKanbanItem[],
  t: (key: string, def?: string) => string,
): V2KanbanLaneData<GarageVehicleKanbanItem>[] {
  return GARAGE_KANBAN_LANES.map((cfg) => {
    const laneItems = items.filter((item) => item.laneKey === cfg.key);
    const laneTotalBilled = laneItems.reduce(
      (acc, curr) => acc + curr.totalBilled,
      0,
    );

    const Icon = cfg.icon;

    return {
      id: cfg.key,
      title: t(cfg.titleKey, cfg.defaultTitle),
      badgeCount: laneItems.length,
      subtotalLabel: laneTotalBilled > 0 ? money(laneTotalBilled) : undefined,
      accentColor: cfg.accentColor,
      accentClassName: cfg.accentClassName,
      icon: React.createElement(Icon, { className: "w-3.5 h-3.5" }),
      items: laneItems,
    };
  });
}
