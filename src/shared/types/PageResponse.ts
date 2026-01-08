/**
 * Page Response Type
 * Generic type for paginated API responses from Spring Boot backend
 * Matches: org.springframework.data.domain.Page structure
 * 
 * @author CHOUABBIA Amine
 * @created 01-08-2026
 */

export interface PageResponse<T> {
  /** Array of content items for current page */
  content: T[];
  
  /** Current page number (0-indexed) */
  number: number;
  
  /** Number of elements in current page */
  size: number;
  
  /** Total number of elements across all pages */
  totalElements: number;
  
  /** Total number of pages */
  totalPages: number;
  
  /** Whether this is the first page */
  first: boolean;
  
  /** Whether this is the last page */
  last: boolean;
  
  /** Number of elements in current page */
  numberOfElements: number;
  
  /** Whether the page is empty */
  empty: boolean;
  
  /** Sorting information */
  sort?: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  
  /** Pageable information */
  pageable?: {
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
    sort?: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
  };
}

/**
 * Helper function to create an empty PageResponse
 */
export const createEmptyPage = <T>(): PageResponse<T> => ({
  content: [],
  number: 0,
  size: 0,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
  numberOfElements: 0,
  empty: true,
});
