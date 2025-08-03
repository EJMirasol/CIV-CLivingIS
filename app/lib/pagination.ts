export type pagination = {
  pageNumber?: number; // default: 1
  pageSize?: number; // default: 10
  sortBy?: string; // field to sort by
  sortOrder?: "asc" | "desc"; // sort direction
};

export const defaultPagination: pagination = {
  pageNumber: 1,
  pageSize: 10,
  sortBy: undefined,
  sortOrder: "asc",
};

export type pagination_metadata = {
  pageNumber?: number; // default: 1
  pageSize?: number; // default: 10
  totalCount?: number; // total number of items
};
