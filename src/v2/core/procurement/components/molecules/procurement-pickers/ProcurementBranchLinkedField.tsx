import { useQuery } from "@tanstack/react-query";
import { V2LinkedField } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  listBranchLinkOptions,
  type BranchLinkOption,
} from "../../../api/procurementLookups";
import type { ProcurementBranchLink } from "../../../hooks/useProcurementRequestBranchLink";

/**
 * Chi nhánh liên kết (PR garage): chọn chi nhánh thì điền tên vào ô song song;
 * sửa tên chỉ đổi trên phiếu, không đổi bản ghi chi nhánh gốc.
 * Id và tên đặt bằng hai callback riêng vì V2LinkedField gọi liên tiếp trong một lượt chọn.
 */
export function ProcurementBranchLinkedField({
  branchId,
  branchName,
  link,
  disabled = false,
  onBranchIdChange,
  onBranchNameChange,
}: {
  branchId: string;
  branchName: string;
  link: ProcurementBranchLink;
  disabled?: boolean;
  onBranchIdChange: (branchId: string) => void;
  onBranchNameChange: (branchName: string) => void;
}) {
  const { t } = useV2Translation();
  const options = useQuery({
    queryKey: ["v2-procurement", "branch-link-options"],
    queryFn: listBranchLinkOptions,
    staleTime: 5 * 60_000,
  });

  return (
    <V2LinkedField
      options={options.data ?? []}
      // Option đi qua V2LinkedField chính là phần tử của `options.data`, luôn mang tên thuần.
      getSourceText={(option) => (option as BranchLinkOption).name}
      loading={options.isFetching}
      fkValue={branchId || null}
      localValue={branchName}
      sourceValue={link.sourceValue}
      overridden={link.overridden}
      fallbackLabel={branchName || undefined}
      disabled={disabled}
      fkLabel={t("v2.procurement.fields.branch", "Chi nhánh")}
      fkPlaceholder={t(
        "v2.procurement.fields.branchPlaceholder",
        "Chọn chi nhánh",
      )}
      localLabel={t(
        "v2.procurement.fields.branchName",
        "Tên chi nhánh trên phiếu",
      )}
      onFkChange={(id) => {
        onBranchIdChange(id ?? "");
        // Bỏ chọn chi nhánh thì bỏ cả tên, như picker chi nhánh cũ.
        if (!id) onBranchNameChange("");
      }}
      onLocalChange={onBranchNameChange}
      onRefresh={link.onRefresh}
    />
  );
}
