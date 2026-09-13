export interface TrackedGoodsPageProps {
  fixedTrackingPolicy?: string;
  title?: string;
  desc?: string;
  initialTab?: string;
}

export interface TabStateRecord {
  page: number;
  pageSize: number;
  search: string;
  searchInput: string;
  itemTypeFilter: string;
  trackingPolicyFilter: string;
  statusFilter: string;
  missingSerialFilter: boolean;
}
