export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

export const parsePagination = (query: Record<string, unknown>): PaginationParams => {
  const rawPage = Number(query.page);
  const rawLimit = Number(query.limit);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(Math.floor(rawLimit), MAX_LIMIT)
      : DEFAULT_LIMIT;
  return { page, limit, skip: (page - 1) * limit };
};

export const buildPaginatedResult = <T>(
  data: T[],
  total: number,
  { page, limit }: PaginationParams,
): PaginatedResult<T> => ({
  data,
  meta: {
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  },
});
