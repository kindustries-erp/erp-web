import type { PostingLineValue } from "./postingLines.helper";

export interface PostingAccountOption {
  value: string;
  label: string;
}

export interface V2PostingLinesEditorProps {
  lines: PostingLineValue[];
  accounts: PostingAccountOption[];
  onChange: (lines: PostingLineValue[]) => void;
  disabled?: boolean;
  /** Thêm dòng thì tự đặt phần chênh vào dòng mới */
  autoBalance?: boolean;
  className?: string;
}
