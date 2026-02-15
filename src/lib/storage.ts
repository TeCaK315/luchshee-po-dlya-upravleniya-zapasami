import type {
  Product,
  InventoryItem,
  SalesChannel,
  StockMovement,
  StorageService as IStorageService,
} from '@/types';

const STORAGE_KEYS = {
  PRODUCTS: 'inventory_products',
  INVENTORY: 'inventory_items',
  CHANNELS: 'sales_channels',
  MOVEMENTS: 'stock_movements',
} as const;

class StorageServiceImpl implements IStorageService {
  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  private getItem<T>(key: string): T[] {
    if (!this.isClient()) return [];
    
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return [];
    }
  }

  private setItem<T>(key: string, data: T[]): void {
    if (!this.isClient()) return;
    
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
    }
  }

  getProducts(): Product[] {
    return this.getItem<Product>(STORAGE_KEYS.PRODUCTS);
  }

  saveProducts(products: Product[]): void {
    this.setItem(STORAGE_KEYS.PRODUCTS, products);
  }

  getInventory(): InventoryItem[] {
    return this.getItem<InventoryItem>(STORAGE_KEYS.INVENTORY);
  }

  saveInventory(inventory: InventoryItem[]): void {
    this.setItem(STORAGE_KEYS.INVENTORY, inventory);
  }

  getChannels(): SalesChannel[] {
    const channels = this.getItem<SalesChannel>(STORAGE_KEYS.CHANNELS);
    
    if (channels.length === 0 && this.isClient()) {
      const defaultChannels: SalesChannel[] = [
        {
          id: 'default-warehouse',
          name: 'Main Warehouse',
          type: 'manual',
          isActive: true,
          lastSyncedAt: null,
          syncStatus: 'idle',
          createdAt: new Date().toISOString(),
        },
      ];
      this.saveChannels(defaultChannels);
      return defaultChannels;
    }
    
    return channels;
  }

  saveChannels(channels: SalesChannel[]): void {
    this.setItem(STORAGE_KEYS.CHANNELS, channels);
  }

  getMovements(): StockMovement[] {
    return this.getItem<StockMovement>(STORAGE_KEYS.MOVEMENTS);
  }

  saveMovements(movements: StockMovement[]): void {
    this.setItem(STORAGE_KEYS.MOVEMENTS, movements);
  }

  clear(): void {
    if (!this.isClient()) return;
    
    try {
      localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
      localStorage.removeItem(STORAGE_KEYS.INVENTORY);
      localStorage.removeItem(STORAGE_KEYS.CHANNELS);
      localStorage.removeItem(STORAGE_KEYS.MOVEMENTS);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
}

export const StorageService = new StorageServiceImpl();