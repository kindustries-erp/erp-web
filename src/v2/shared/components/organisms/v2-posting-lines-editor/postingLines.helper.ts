/** Một dòng bút toán khi soạn; `id` là khóa React phía client */
export interface PostingLineValue {
  id: string;
  accountId: string;
  debit: number;
  credit: number;
  description: string;
}

export interface PostingLinesTotals {
  totalDebit: number;
  totalCredit: number;
  /** Nợ trừ Có; dương là Nợ thừa */
  difference: number;
  balanced: boolean;
}

/** Làm tròn về 2 chữ số thập phân để tránh sai số số thực khi cộng nhiều dòng */
const round2 = (value: number): number => Math.round(value * 100) / 100;

const createId = (): string =>
  (
    globalThis as { crypto?: { randomUUID?: () => string } }
  ).crypto?.randomUUID?.() ??
  `line-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const createPostingLine = (
  overrides: Partial<Omit<PostingLineValue, "id">> = {},
): PostingLineValue => ({
  id: createId(),
  accountId: "",
  debit: 0,
  credit: 0,
  description: "",
  ...overrides,
});

export const totalsOf = (lines: PostingLineValue[]): PostingLinesTotals => {
  const totalDebit = round2(lines.reduce((sum, l) => sum + (l.debit || 0), 0));
  const totalCredit = round2(
    lines.reduce((sum, l) => sum + (l.credit || 0), 0),
  );
  const difference = round2(totalDebit - totalCredit);
  return {
    totalDebit,
    totalCredit,
    difference,
    balanced: Math.abs(difference) < 0.01,
  };
};

/**
 * Thêm dòng. Khi `autoBalance` và bảng đang lệch, dòng mới nhận phần chênh ở bên còn thiếu:
 * Nợ thừa thì dòng mới ghi Có, Có thừa thì ghi Nợ.
 */
export const addPostingLine = (
  lines: PostingLineValue[],
  options: { autoBalance?: boolean; description?: string } = {},
): PostingLineValue[] => {
  const { difference } = totalsOf(lines);
  const gap = options.autoBalance && Math.abs(difference) >= 0.01;
  const line = createPostingLine({
    description: options.description ?? "",
    debit: gap && difference < 0 ? round2(-difference) : 0,
    credit: gap && difference > 0 ? round2(difference) : 0,
  });
  return [...lines, line];
};

/** Sửa một dòng; một dòng chỉ được có Nợ hoặc Có, nhập bên nào thì xóa bên kia */
export const updatePostingLine = (
  lines: PostingLineValue[],
  id: string,
  patch: Partial<Omit<PostingLineValue, "id">>,
): PostingLineValue[] =>
  lines.map((line) => {
    if (line.id !== id) return line;
    const next = { ...line, ...patch };
    if (patch.debit !== undefined && patch.debit > 0) next.credit = 0;
    if (patch.credit !== undefined && patch.credit > 0) next.debit = 0;
    return next;
  });

export const removePostingLine = (
  lines: PostingLineValue[],
  id: string,
): PostingLineValue[] => lines.filter((line) => line.id !== id);
