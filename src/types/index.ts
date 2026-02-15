// src/types/index.ts - Complete TypeScript definitions

// ============================================================================
// DATA MODELS
// ============================================================================

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  price: number;
  cost: number;
  reorderPoint: number;
  reorderQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  channelId: string;
  quantity: number;
  reserved: number;
  available: number;
  lastSyncedAt: string;
  updatedAt: string;
}

export interface SalesChannel {
  id: string;
  name: string;
  type: 'shopify' | 'woocommerce' | 'amazon' | 'ebay' | 'manual';
  apiKey?: string;
  apiSecret?: string;
  storeUrl?: string;
  isActive: boolean;
  lastSyncedAt: string | null;
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
  syncError?: string;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  channelId: string;
  type: 'purchase' | 'sale' | 'adjustment' | 'transfer' | 'return';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason?: string;
  reference?: string;
  createdAt: string;
  createdBy: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'staff';
  createdAt: string;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

// Products API
export interface CreateProductRequest {
  sku: string;
  name: string;
  description: string;
  category: string;
  price: number;
  cost: number;
  reorderPoint: number;
  reorderQuantity: number;
  initialStock?: {
    channelId: string;
    quantity: number;
  }[];
}

export interface CreateProductResponse {
  success: boolean;
  product: Product;
  inventory: InventoryItem[];
}

export interface UpdateProductRequest {
  sku?: string;
  name?: string;
  description?: string;
  category?: string;
  price?: number;
  cost?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
}

export interface UpdateProductResponse {
  success: boolean;
  product: Product;
}

export interface GetProductsResponse {
  success: boolean;
  products: Product[];
  total: number;
}

export interface DeleteProductResponse {
  success: boolean;
  message: string;
}

// Inventory API
export interface GetInventoryResponse {
  success: boolean;
  inventory: (InventoryItem & {
    product: Product;
    channel: SalesChannel;
  })[];
}

export interface SyncInventoryRequest {
  channelId: string;
  productIds?: string[];
}

export interface SyncInventoryResponse {
  success: boolean;
  syncedCount: number;
  errors: {
    productId: string;
    error: string;
  }[];
  lastSyncedAt: string;
}

// Stock Movements API
export interface CreateStockMovementRequest {
  productId: string;
  channelId: string;
  type: 'purchase' | 'sale' | 'adjustment' | 'transfer' | 'return';
  quantity: number;
  reason?: string;
  reference?: string;
}

export interface CreateStockMovementResponse {
  success: boolean;
  movement: StockMovement;
  updatedInventory: InventoryItem;
}

export interface GetStockMovementsResponse {
  success: boolean;
  movements: (StockMovement & {
    product: Product;
    channel: SalesChannel;
  })[];
  total: number;
}

// Channels API
export interface GetChannelsResponse {
  success: boolean;
  channels: SalesChannel[];
}

export interface CreateChannelRequest {
  name: string;
  type: 'shopify' | 'woocommerce' | 'amazon' | 'ebay' | 'manual';
  apiKey?: string;
  apiSecret?: string;
  storeUrl?: string;
}

export interface CreateChannelResponse {
  success: boolean;
  channel: SalesChannel;
}

// Dashboard API
export interface DashboardStats {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  recentMovements: StockMovement[];
  topProducts: {
    product: Product;
    totalQuantity: number;
    totalValue: number;
  }[];
  channelStats: {
    channel: SalesChannel;
    productCount: number;
    totalQuantity: number;
  }[];
}

export interface GetDashboardStatsResponse {
  success: boolean;
  stats: DashboardStats;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface ProductFormProps {
  product?: Product;
  onSubmit: (data: CreateProductRequest | UpdateProductRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface InventoryTableProps {
  inventory: (InventoryItem & {
    product: Product;
    channel: SalesChannel;
  })[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onSync: (channelId: string) => void;
  isLoading?: boolean;
}

export interface StockMovementListProps {
  movements: (StockMovement & {
    product: Product;
    channel: SalesChannel;
  })[];
  onFilter: (filters: StockMovementFilters) => void;
  isLoading?: boolean;
}

export interface StockMovementFilters {
  productId?: string;
  channelId?: string;
  type?: StockMovement['type'];
  startDate?: string;
  endDate?: string;
}

export interface ChannelSyncProps {
  channels: SalesChannel[];
  onSync: (channelId: string) => Promise<void>;
  onAdd: () => void;
  onEdit: (channel: SalesChannel) => void;
  onDelete: (channelId: string) => void;
  isLoading?: boolean;
}

export interface DashboardStatsProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

export interface LowStockAlertProps {
  products: (Product & {
    currentStock: number;
    channels: {
      channel: SalesChannel;
      quantity: number;
    }[];
  })[];
  onReorder: (productId: string) => void;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface StorageService {
  getProducts: () => Product[];
  saveProducts: (products: Product[]) => void;
  getInventory: () => InventoryItem[];
  saveInventory: (inventory: InventoryItem[]) => void;
  getChannels: () => SalesChannel[];
  saveChannels: (channels: SalesChannel[]) => void;
  getMovements: () => StockMovement[];
  saveMovements: (movements: StockMovement[]) => void;
  clear: () => void;
}

export interface InventoryCalculator {
  calculateAvailable: (quantity: number, reserved: number) => number;
  calculateTotalValue: (products: Product[], inventory: InventoryItem[]) => number;
  isLowStock: (product: Product, currentStock: number) => boolean;
  isOutOfStock: (currentStock: number) => boolean;
  calculateReorderQuantity: (product: Product, currentStock: number) => number;
  aggregateInventoryByProduct: (inventory: InventoryItem[]) => Map<string, number>;
}

export interface ChannelIntegration {
  type: SalesChannel['type'];
  connect: (credentials: ChannelCredentials) => Promise<boolean>;
  syncInventory: (productIds: string[]) => Promise<SyncResult[]>;
  updateStock: (productId: string, quantity: number) => Promise<boolean>;
  disconnect: () => Promise<void>;
}

export interface ChannelCredentials {
  apiKey: string;
  apiSecret?: string;
  storeUrl?: string;
}

export interface SyncResult {
  productId: string;
  success: boolean;
  quantity?: number;
  error?: string;
}

export interface ApiClient {
  get: <T>(url: string) => Promise<T>;
  post: <T>(url: string, data: unknown) => Promise<T>;
  put: <T>(url: string, data: unknown) => Promise<T>;
  delete: <T>(url: string) => Promise<T>;
}

export interface DatabaseConnection {
  query: <T>(sql: string, params?: unknown[]) => Promise<T[]>;
  queryOne: <T>(sql: string, params?: unknown[]) => Promise<T | null>;
  execute: (sql: string, params?: unknown[]) => Promise<void>;
  transaction: <T>(callback: (client: DatabaseConnection) => Promise<T>) => Promise<T>;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  details?: unknown;
}

export class InventoryError extends Error {
  code: string;
  statusCode: number;
  details?: unknown;

  constructor(message: string, code: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = 'InventoryError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}