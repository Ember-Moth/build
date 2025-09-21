/**
 * Base pagination parameters, applicable to all paginated queries.
 */
export interface BaseParams {
  /** Current page number (default: 1) */
  page?: number;
  /** Number of items per page (default: 10) */
  size?: number;
}

/**
 * Pagination result information
 */
export interface PaginationInfo {
  /** Total number of records */
  total: number;
  /** Current page number */
  current: number;
  /** Number of items per page */
  size: number;
  /** Whether there is more data available */
  hasMore?: boolean;
}

/**
 * Generic state management store.
 * @template T Type of data items (list is always an array of T, detail is a single T).
 * @template P Type of query parameters (defaults to BaseParams, can be extended).
 * @template S Type of selected data (defaults to T | null, supports single/multiple selection).
 */
export interface BaseStore<T, P = Record<string, any>, S = Partial<T> | null> {
  /** List of data items */
  list: T[];

  /** Detail data, representing a single item from the list */
  detail: T | null;

  /** Query parameters, includes pagination and other filtering options */
  params: P & BaseParams;

  /** Currently selected data, can be a single object or an array (for multi-selection) */
  selected: S;

  /** Pagination information */
  pagination: PaginationInfo;

  /** Loading state for different operations (list, detail, etc.) */
  loading: {
    /** Loading state for list data */
    list: boolean;
    /** Loading state for detail data */
    detail: boolean;
    /** Loading state for creating a new item */
    create: boolean;
    /** Loading state for updating an existing item */
    update: boolean;
    /** Loading state for deleting an item */
    delete: boolean;
  };

  /** Meta data, can be used to store any additional information related to the store */
  meta: Record<string, any>;
}

/**
 * Default values for the loading state.
 */
export const LOADING_STATE = {
  list: false,
  detail: false,
  create: false,
  update: false,
  delete: false,
};

/**
 * Default values for the BaseStore fields.
 */
export const DEFAULT_STORE = {
  list: [] as any[], // Default empty array for list
  detail: null, // Default null for detail
  params: {
    page: 1,
    size: 10,
  }, // Default pagination params
  selected: null, // Default null for selected
  pagination: {
    total: 0,
    current: 1,
    size: 10,
    hasMore: false,
  }, // Default pagination info
  loading: LOADING_STATE, // Use LOADING_STATE for all loading states
  meta: {}, // Default empty object for meta data
};
