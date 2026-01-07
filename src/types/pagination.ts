/**
 * Pagination Types
 * 
 * Spring Boot compatible pagination types for API requests and responses.
 * 
 * @author CHOUABBIA Amine
 * @created 01-07-2026
 */

/**
 * Pageable - Request parameters for paginated queries
 */
export interface Pageable {
  page: number; // Zero-based page index
  size: number; // Number of items per page
  sort?: string; // Sort specification (e.g., "name,asc" or "createdAt,desc")
}

/**
 * Sort - Sorting information
 */
export interface Sort {
  sorted: boolean;
  unsorted: boolean;
  empty: boolean;
}

/**
 * PageableInfo - Pagination metadata in response
 */
export interface PageableInfo {
  pageNumber: number;
  pageSize: number;
  sort: Sort;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

/**
 * Page<T> - Generic paginated response from Spring Boot
 */
export interface Page<T> {
  content: T[]; // Array of items for current page
  pageable: PageableInfo; // Pagination information
  totalElements: number; // Total number of items across all pages
  totalPages: number; // Total number of pages
  size: number; // Page size
  number: number; // Current page number (zero-based)
  numberOfElements: number; // Number of items in current page
  first: boolean; // Is this the first page?
  last: boolean; // Is this the last page?
  empty: boolean; // Is the page empty?
  sort: Sort; // Sort information
}

/**
 * Helper function to create default Pageable
 */
export const createPageable = (page: number = 0, size: number = 20, sort?: string): Pageable => ({
  page,
  size,
  sort,
});

/**
 * Helper function to check if there are more pages
 */
export const hasMorePages = <T>(page: Page<T>): boolean => {
  return !page.last;
};

/**
 * Helper function to get next page number
 */
export const getNextPage = <T>(page: Page<T>): number | null => {
  return page.last ? null : page.number + 1;
};

/**
 * Helper function to get previous page number
 */
export const getPreviousPage = <T>(page: Page<T>): number | null => {
  return page.first ? null : page.number - 1;
};
