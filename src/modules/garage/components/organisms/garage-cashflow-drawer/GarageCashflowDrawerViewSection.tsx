import React from "react";
import { DrawerRow } from "@/shared/components/DrawerModal";
import type { GarageCashflowVoucher } from "../../../api/garageCashflowApi";

interface GarageCashflowDrawerViewSectionProps {
  voucher: GarageCashflowVoucher | null;
}

export const GarageCashflowDrawerViewSection: React.FC<
  GarageCashflowDrawerViewSectionProps
> = ({ voucher }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
      <DrawerRow
        label="Ngày giao dịch"
        value={
          voucher?.transDate
            ? new Date(voucher.transDate).toLocaleDateString("vi-VN")
            : "—"
        }
      />
      <DrawerRow label="Mã chứng từ" value={voucher?.voucherCode || "—"} />
      <DrawerRow
        label="Loại phiếu"
        value={
          (voucher?.voucherType || "").toUpperCase() === "RECEIPT"
            ? "Phiếu Thu"
            : "Phiếu Chi"
        }
      />
      {(voucher?.voucherType || "").toUpperCase() === "PAYMENT" && (
        <DrawerRow
          label="Trạng thái"
          value={
            voucher?.paymentStatus === "PENDING"
              ? "Chờ duyệt"
              : voucher?.paymentStatus === "APPROVED"
                ? "Đã duyệt"
                : voucher?.paymentStatus === "PAID"
                  ? "Đã chi"
                  : "—"
          }
        />
      )}
      <DrawerRow label="Phương thức TT" value={voucher?.paymentMethod || "—"} />
      <DrawerRow label="Nội dung TT" value={voucher?.paymentContent || "—"} />
      <DrawerRow
        label="Số tiền"
        value={`${(voucher?.amount || 0).toLocaleString("vi-VN")} đ`}
      />
      <DrawerRow
        label="Mã Phiếu Dịch Vụ"
        value={
          voucher?.case?.soChungTu
            ? voucher.case.soChungTu
            : voucher?.caseId || "—"
        }
      />
      <DrawerRow
        label="Đối tác"
        value={voucher?.partnerName || voucher?.case?.khachHangName || "—"}
      />
      <DrawerRow
        label="Biển số xe"
        value={voucher?.licensePlate || voucher?.case?.bienSoXe || "—"}
      />
      <div className="col-span-1 md:col-span-2">
        <DrawerRow label="Ghi chú" value={voucher?.note || "—"} />
      </div>
    </div>
  );
};
