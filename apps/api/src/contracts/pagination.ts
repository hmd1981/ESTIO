/**
 * Shared list contract for future paginated endpoints (offset or cursor).
 * Wire query DTOs + repository methods when list APIs grow beyond simple findMany.
 */
export interface OffsetPaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedMeta extends OffsetPaginationParams {
  total: number;
  pageCount: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginatedMeta;
}
