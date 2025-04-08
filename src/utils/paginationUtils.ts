
/**
 * Utility functions for handling pagination in API requests
 */

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Creates query parameters for pagination
 */
export const createPaginationParams = (
  page: number = 1,
  limit: number = 10,
  sort?: string,
  order?: 'asc' | 'desc'
): PaginationParams => {
  return {
    page,
    limit,
    ...(sort && { sort }),
    ...(order && { order }),
  };
};

/**
 * Creates links for pagination UI
 */
export const createPaginationLinks = (
  currentPage: number,
  totalPages: number,
  maxVisiblePages: number = 5
): { label: string | number; page: number; isActive: boolean }[] => {
  if (totalPages <= 1) {
    return [{ label: 1, page: 1, isActive: true }];
  }

  const links: { label: string | number; page: number; isActive: boolean }[] = [];

  // Calculate the start and end pages to show
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  // Adjust if we're at the end of the range
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  // Add first page and ellipsis if needed
  if (startPage > 1) {
    links.push({ label: 1, page: 1, isActive: false });
    if (startPage > 2) {
      links.push({ label: '...', page: startPage - 1, isActive: false });
    }
  }

  // Add numbered pages
  for (let i = startPage; i <= endPage; i++) {
    links.push({ label: i, page: i, isActive: i === currentPage });
  }

  // Add last page and ellipsis if needed
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      links.push({ label: '...', page: endPage + 1, isActive: false });
    }
    links.push({ label: totalPages, page: totalPages, isActive: false });
  }

  return links;
};
