import { useState, useMemo } from "react";
import { type PostingLineData } from "./PostingSection";

export interface PostingState {
  postingDate: string;
  description: string;
  lines: PostingLineData[];
}

export function usePosting(initialState?: Partial<PostingState>) {
  const [postingDate, setPostingDate] = useState(
    initialState?.postingDate !== undefined ? initialState.postingDate : "",
  );
  const [description, setDescription] = useState(
    initialState?.description || "",
  );
  const [lines, setLines] = useState<PostingLineData[]>(
    initialState?.lines || [],
  );
  const [isDirty, setIsDirty] = useState(false);

  // Computed totals
  const totalDebit = useMemo(
    () => lines.reduce((sum, line) => sum + (line.debit || 0), 0),
    [lines],
  );
  const totalCredit = useMemo(
    () => lines.reduce((sum, line) => sum + (line.credit || 0), 0),
    [lines],
  );

  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  // Actions
  const addLine = () => {
    setLines([
      ...lines,
      {
        id: crypto.randomUUID(),
        accountId: "",
        debit: 0,
        credit: 0,
        description: "",
      },
    ]);
    setIsDirty(true);
  };

  const removeLine = (id: string) => {
    setLines(lines.filter((l) => l.id !== id));
    setIsDirty(true);
  };

  const updateLine = (id: string, field: keyof PostingLineData, value: any) => {
    setLines(
      lines.map((l) => {
        if (l.id !== id) return l;
        const updated = { ...l, [field]: value };
        if (field === "debit" && value > 0) updated.credit = 0;
        if (field === "credit" && value > 0) updated.debit = 0;
        return updated;
      }),
    );
    setIsDirty(true);
  };

  const setAllState = (state: PostingState) => {
    setPostingDate(state.postingDate);
    setDescription(state.description);
    setLines(state.lines);
    setIsDirty(true);
  };

  const reset = () => {
    setPostingDate("");
    setDescription("");
    setLines([]);
    setIsDirty(false);
  };

  return {
    postingDate,
    setPostingDate: (d: string) => {
      setPostingDate(d);
      setIsDirty(true);
    },
    description,
    setDescription: (d: string) => {
      setDescription(d);
      setIsDirty(true);
    },
    lines,
    setLines: (newLines: PostingLineData[]) => {
      setLines(newLines);
      setIsDirty(true);
    },
    totalDebit,
    totalCredit,
    isBalanced,
    isDirty,
    setIsDirty,
    addLine,
    removeLine,
    updateLine,
    setAllState,
    reset,
  };
}
