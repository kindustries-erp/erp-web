import { V2DrawerRowList, type DrawerRowConfig } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { ProcurementRequestFormValue } from "../../../../form/procurementRequest.form";

/** Chế độ xem đầu đề đề nghị: danh sách dọc, theo đúng thứ tự nhập (chi nhánh trước nội dung). */
export function ProcurementRequestHeaderView({
  form,
}: {
  form: ProcurementRequestFormValue;
}) {
  const { t } = useV2Translation();
  const rows: DrawerRowConfig[] = [
    {
      key: "branch",
      label: t("v2.procurement.fields.branch", "Chi nhánh"),
      value: form.branchName || "—",
    },
    {
      key: "requestDate",
      label: t("v2.procurement.fields.requestDate", "Ngày đề nghị"),
      value: form.requestDate || "—",
    },
    {
      key: "neededDate",
      label: t("v2.procurement.fields.neededDate", "Ngày cần hàng"),
      value: form.neededDate || "—",
    },
    {
      key: "title",
      label: t("v2.procurement.fields.title", "Nội dung"),
      value: form.title || "—",
      multiline: true,
    },
    {
      key: "remarks",
      label: t("v2.procurement.fields.remarks", "Ghi chú"),
      value: form.remarks || "—",
      multiline: true,
    },
  ];
  return <V2DrawerRowList rows={rows} />;
}
