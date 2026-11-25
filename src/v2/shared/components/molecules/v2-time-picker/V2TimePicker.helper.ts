import type { V2TimeParts } from "./V2TimePicker.type";

export const pad2 = (n: number) => String(n).padStart(2, "0");

/** `HH:mm` → giờ/phút; sai định dạng trả null. */
export function parseTime(
  value: string | null | undefined,
): V2TimeParts | null {
  const m = /^(\d{2}):(\d{2})$/.exec(value ?? "");
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}

export const formatTime = ({ hour, minute }: V2TimeParts) =>
  `${pad2(hour)}:${pad2(minute)}`;

export const HOURS = Array.from({ length: 24 }, (_, i) => i);

/** Phút theo bước; thêm phút đang chọn nếu lệch bước để không mất giá trị. */
export function buildMinutes(step: number, current?: number): number[] {
  const safe = Math.min(Math.max(Math.floor(step) || 1, 1), 30);
  const list = Array.from({ length: Math.ceil(60 / safe) }, (_, i) => i * safe);
  if (current !== undefined && !list.includes(current)) {
    list.push(current);
    list.sort((a, b) => a - b);
  }
  return list;
}

/** Mốc `hour:minute` có sau `maxTime` không (không có `maxTime` thì luôn false). */
export function isAfterMax(
  hour: number,
  minute: number,
  maxTime?: string,
): boolean {
  const max = parseTime(maxTime);
  if (!max) return false;
  return hour * 60 + minute > max.hour * 60 + max.minute;
}
