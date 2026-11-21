import React from "react";
import type { GarageCaseDetailRow } from "@/modules/garage/components/organisms/garage-cases-detail-drawer/components/GarageCasesTableTab.type";
import type { V2KanbanLaneData } from "@/v2/shared/components/organisms/v2-kanban-board";
import { money } from "@/shared/utils/format";
import { GARAGE_KANBAN_LANES } from "./garageCaseKanban.config";
import type {
  GarageKanbanLaneKey,
  GarageVehicleKanbanItem,
} from "./garageCaseKanban.type";

export function determineCaseLane(c: GarageCaseDetailRow): GarageKanbanLaneKey {
  const statusStr = (c.serviceStatus || "").toLowerCase();

  if (
    c.tinhTrangDichVu === 9 ||
    statusStr.includes("hủy") ||
    statusStr.includes("từ chối")
  ) {
    return "CANCELLED";
  }

  if (
    c.tinhTrangDichVu === 3 ||
    statusStr.includes("hoàn thành") ||
    statusStr.includes("kết thúc") ||
    statusStr.includes("hoàn tất") ||
    statusStr.includes("giao xe") ||
    Boolean(c.ngayHoanThanh)
  ) {
    return "COMPLETED";
  }

  if (
    c.tinhTrangDichVu === 2 ||
    statusStr.includes("đang sửa") ||
    statusStr.includes("đang làm") ||
    statusStr.includes("sửa chữa") ||
    statusStr.includes("gia công") ||
    statusStr.includes("kiểm tra") ||
    statusStr.includes("xử lý")
  ) {
    return "IN_PROGRESS";
  }

  if (
    c.tinhTrangDichVu === 1 ||
    statusStr.includes("báo giá") ||
    statusStr.includes("nháp") ||
    statusStr.includes("chờ duyệt")
  ) {
    return "QUOTATION";
  }

  if (c.tinhTrangDichVu === 0 || statusStr.includes("tiếp nhận")) {
    return "INTAKE";
  }

  return "IN_PROGRESS";
}

export function groupCasesByVehicle(
  cases: GarageCaseDetailRow[],
): GarageVehicleKanbanItem[] {
  const groupMap = new Map<string, GarageVehicleKanbanItem>();

  for (const c of cases) {
    const rawPlate = (c.bienSoXe || "").trim().toUpperCase();
    const plate = rawPlate || c.soChungTu || c.id;
    const caseLane = determineCaseLane(c);
    const groupKey = `${plate}::${caseLane}`;

    if (!groupMap.has(groupKey)) {
      groupMap.set(groupKey, {
        id: groupKey,
        licensePlate: rawPlate || c.soChungTu || "—",
        customerName: c.khachHangName || "—",
        customerCode: c.khachHangCode,
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
      if (c.khachHangName && item.customerName === "—") {
        item.customerName = c.khachHangName;
      }
      if (c.soChungTu) {
        item.latestCaseCode = c.soChungTu;
      }
      if (c.ngayHoanThanh) {
        item.latestDate = c.ngayHoanThanh;
      }
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
      icon: React.createElement(Icon, { className: "w-3.5 h-3.5" }),
      items: laneItems,
    };
  });
}

export function moveVehicleToLane(
  items: GarageVehicleKanbanItem[],
  itemId: string,
  targetLaneKey: GarageKanbanLaneKey,
): GarageVehicleKanbanItem[] {
  return items.map((item) => {
    if (item.id === itemId) {
      const plate = item.licensePlate;
      return {
        ...item,
        id: `${plate}::${targetLaneKey}`,
        laneKey: targetLaneKey,
      };
    }
    return item;
  });
}
