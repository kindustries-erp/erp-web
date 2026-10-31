export interface V2MobileNavCustomizeBarProps {
  currentCount: number;
  maxCount: number;
  isCustomizing: boolean;
  limitWarning: string | null;
  onStartCustomize: () => void;
  onFinishCustomize: () => void;
  onResetDefault: () => void;
}
