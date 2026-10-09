export interface V2PageToolbarSlotProps {
  /** Khóa tab mà slot này thuộc về */
  tabKey: string;
  /** Tab đang chọn: chỉ slot active hiển thị */
  active: boolean;
  /** Đăng ký phần tử DOM của slot để bảng/toolbar portal vào */
  register: (key: string, el: HTMLElement | null) => void;
}
