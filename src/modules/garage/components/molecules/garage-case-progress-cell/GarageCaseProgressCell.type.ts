export type GarageProgressType = "receivable" | "payable";

export interface GarageCaseProgressCellProps {
  type: GarageProgressType;
  total: number;
  paid: number;
  balance: number;
}
