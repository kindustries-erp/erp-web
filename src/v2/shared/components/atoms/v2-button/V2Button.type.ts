import type React from "react";
import type { ButtonProps } from "@/v2/shared/ui";

export interface V2ButtonProps extends ButtonProps {
  /** Hiển thị trạng thái đang xử lý kèm spinner xoay */
  isLoading?: boolean;
  /** Văn bản thay thế khi đang loading */
  loadingText?: string;
  /** Icon hiển thị bên trái văn bản */
  leftIcon?: React.ReactNode;
  /** Icon hiển thị bên phải văn bản */
  rightIcon?: React.ReactNode;
  /** Kéo rộng 100% chiều ngang container */
  fullWidth?: boolean;
}
