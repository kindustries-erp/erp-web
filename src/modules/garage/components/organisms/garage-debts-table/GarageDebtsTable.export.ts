import toast from "react-hot-toast";
import type { CustomerDebtItem } from "@/modules/garage/hooks/useGarageCustomersList";

export async function exportGarageDebtsCsv(
  items: CustomerDebtItem[],
  branches: any[] | undefined,
  t: (key: string, fallback: string) => string,
) {
  try {
    toast.loading(
      t("garage:cases.exportDrawer.downloading", "Đang xuất dữ liệu..."),
      { id: "quick-export-garage-debt" },
    );

    if (!items || items.length === 0) {
      toast.error(t("garage:customers.empty", "Không có dữ liệu để xuất"), {
        id: "quick-export-garage-debt",
      });
      return;
    }

    const headers = [
      "Mã khách hàng",
      "Tên khách hàng",
      "Số phiếu DV",
      "Tổng phải thu",
      "Đã thu",
      "Còn phải thu",
      "Nợ 0-30 ngày",
      "Nợ 31-60 ngày",
      "Nợ 61-90 ngày",
      "Nợ >90 ngày",
      "Tuổi nợ (ngày)",
      "Ngày gần nhất",
      "Chi nhánh",
    ];

    const csvRows = [headers.join(",")];
    for (const row of items) {
      const branchObj = branches?.find(
        (b: any) => b.externalId === row.branchExternalId,
      );
      const branchLabel = branchObj?.name || row.branchExternalId || "";
      csvRows.push(
        [
          `"${(row.customerCode || "").replace(/"/g, '""')}"`,
          `"${(row.customerName || "").replace(/"/g, '""')}"`,
          row.caseCount,
          row.totalAmount,
          row.paidAmount,
          row.balanceAmount,
          row.aging0_30,
          row.aging31_60,
          row.aging61_90,
          row.agingOver90,
          row.maxAgingDays,
          `"${row.latestDate ? row.latestDate.slice(0, 10) : ""}"`,
          `"${branchLabel.replace(/"/g, '""')}"`,
        ].join(","),
      );
    }

    const blob = new Blob(["\uFEFF" + csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = blobUrl;
    a.download = `Bao_cao_cong_no_garage_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
      window.URL.revokeObjectURL(blobUrl);
    }, 2000);

    toast.success(t("common:exportSuccess", "Đã tải xuống bảng kê công nợ."), {
      id: "quick-export-garage-debt",
    });
  } catch (e: any) {
    toast.error(
      e?.message ||
        t("garage:cases.exportDrawer.downloadFailed", "Xuất file thất bại."),
      { id: "quick-export-garage-debt" },
    );
  }
}
