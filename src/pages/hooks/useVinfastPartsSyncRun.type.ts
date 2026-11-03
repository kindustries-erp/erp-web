export interface SyncProgressEvent {
  message: string;
  processId: string;
  currentItem?: string;
  current: number;
  total: number;
  completed: boolean;
}

export interface StartVinfastSyncParams {
  syncRange: "custom" | "all";
  dateFrom?: string;
  dateTo?: string;
  clearDb: boolean;
}
