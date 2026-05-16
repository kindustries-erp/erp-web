import React, { useEffect, useState } from "react";
import { Combobox } from "@/shared/components/Combobox";
import { branchApi, Branch } from "./branchApi";
import { useT } from "@/core/i18n";

interface BranchSelectProps {
  value?: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowClear?: boolean;
}

export function BranchSelect({ value, onChange, placeholder, disabled, className, allowClear }: BranchSelectProps) {
  const t = useT();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    branchApi.getBranchOptions().then((res) => {
      if (mounted) {
        setBranches(res || []);
        setLoading(false);
      }
    }).catch((err) => {
      console.error("Failed to load branch options:", err);
      if (mounted) setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Combobox
      options={branches.map((b) => ({ value: b.id, label: `${b.name}${b.code ? ` (${b.code})` : ""}` }))}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder || t("Chọn chi nhánh")}
      disabled={disabled || loading}
      className={className}
      allowClear={allowClear}
    />
  );
}
