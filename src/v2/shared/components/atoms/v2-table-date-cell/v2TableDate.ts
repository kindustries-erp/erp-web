const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

export interface V2DateParts {
  date: string;
  time?: string;
}

const pad = (value: number): string => String(value).padStart(2, "0");

export const formatDateTimeParts = (
  value: string | number | Date | null | undefined,
): V2DateParts | null => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "string") {
    const match = DATE_ONLY.exec(value.trim());
    if (match) return { date: `${match[3]}/${match[2]}/${match[1]}` };
  }
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  const date = `${pad(parsed.getDate())}/${pad(parsed.getMonth() + 1)}/${parsed.getFullYear()}`;
  const hasTime =
    parsed.getHours() > 0 || parsed.getMinutes() > 0 || parsed.getSeconds() > 0;
  return hasTime
    ? { date, time: `${pad(parsed.getHours())}:${pad(parsed.getMinutes())}` }
    : { date };
};
