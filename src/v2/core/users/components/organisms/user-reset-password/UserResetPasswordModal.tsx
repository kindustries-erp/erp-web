import * as React from "react";
import { V2ConfirmModal, V2Text, V2TextField } from "@/v2/shared/components";
import { isValidUserPassword } from "../../../domain/rules/userRules";

export interface UserResetPasswordModalProps {
  open: boolean;
  email: string;
  loading: boolean;
  t: (key: string, fallback?: string) => string;
  onSubmit: (password: string) => void;
  onCancel: () => void;
}

/** Hộp thoại nhập mật khẩu mới; xóa giá trị khi đóng để không giữ mật khẩu trong state */
export function UserResetPasswordModal(props: UserResetPasswordModalProps) {
  const { open, t } = props;
  const [password, setPassword] = React.useState("");
  React.useEffect(() => {
    if (!open) setPassword("");
  }, [open]);

  return (
    <V2ConfirmModal
      open={open}
      title={t("v2.users.reset.title", "Đặt lại mật khẩu")}
      message={
        <div className="space-y-2">
          <V2Text>
            {t("v2.users.reset.message", "Nhập mật khẩu mới cho")}{" "}
            <V2Text weight="semibold">{props.email}</V2Text>
          </V2Text>
          <V2TextField
            viewing={false}
            type="password"
            value={password}
            onChange={setPassword}
          />
          <V2Text className="text-xs text-muted-fg">
            {t(
              "v2.users.reset.hint",
              "Từ 8 đến 72 ký tự. Các phiên đăng nhập hiện có sẽ bị thu hồi.",
            )}
          </V2Text>
        </div>
      }
      confirmLabel={t("v2.users.reset.confirm", "Đặt lại")}
      cancelLabel={t("v2.common.cancel", "Hủy")}
      variant="warning"
      isLoading={props.loading}
      confirmDisabled={!isValidUserPassword(password)}
      onConfirm={() => props.onSubmit(password)}
      onCancel={props.onCancel}
    />
  );
}
