import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
} from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import {
  createBranchApi,
  updateBranchApi,
  type Branch,
} from "@/modules/branches/api/branchApi";
import { useT } from "@/core/i18n";
import { Checkbox } from "@/shared/components/ui/checkbox";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  onClose: () => void;
  branch: Branch | null;
  onSuccess: () => void;
}

export function BranchFormDrawer({ open, onClose, branch, onSuccess }: Props) {
  const t = useT();
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (branch) {
      setCode(branch.code);
      setName(branch.name);
      setIsActive(branch.is_active !== false);
    } else {
      setCode("");
      setName("");
      setIsActive(true);
    }
  }, [branch, open]);

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const payload = { code, name, is_active: isActive };
      if (branch) {
        return updateBranchApi(branch.id, payload);
      }
      return createBranchApi(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches:list"] });
      queryClient.invalidateQueries({ queryKey: ["branchOptions"] });
      onSuccess();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err.message);
    },
  });

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title={branch ? "Cập nhật chi nhánh" : "Tạo mới chi nhánh"}
    >
      <div className="space-y-6">
        <DrawerSection title="Thông tin chung">
          <DrawerField label="Mã chi nhánh *" required>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
              placeholder="VD: MB-001"
            />
          </DrawerField>

          <DrawerField label="Tên chi nhánh *" required>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
              placeholder="VD: Chi nhánh miền Bắc"
            />
          </DrawerField>

          <DrawerField label="Trạng thái">
            <div className="flex items-center space-x-2 h-10">
              <Checkbox
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(!!checked)}
              />
              <span className="text-sm font-medium">Hoạt động</span>
            </div>
          </DrawerField>
        </DrawerSection>

        <div className="flex items-center justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={() => mutate()}
            disabled={isPending || !code.trim() || !name.trim()}
          >
            {t("common.save")}
          </Button>
        </div>
      </div>
    </DrawerModal>
  );
}
