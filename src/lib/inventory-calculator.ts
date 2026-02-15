import type {
  Product,
  InventoryItem,
  InventoryCalculator as IInventoryCalculator,
} from '@/types';

class InventoryCalculatorImpl implements IInventoryCalculator {
  calculateAvailable(quantity: number, reserved: number): number {
    const available = quantity - reserved;
    return Math.max(0, available);
  }

  calculateTotalValue(products: Product[], inventory: InventoryItem[]): number {
    const inventoryMap = new Map<string, number>();
    
    inventory.forEach((item) => {
      const current = inventoryMap.get(item.productId) || 0;
      inventoryMap.set(item.productId, current + item.quantity);
    });

    let totalValue = 0;
    
    products.forEach((product) => {
      const quantity = inventoryMap.get(product.id) || 0;
      totalValue += product.cost * quantity;
    });

    return totalValue;
  }

  isLowStock(product: Product, currentStock: number): boolean {
    return currentStock > 0 && currentStock <= product.reorderPoint;
  }

  isOutOfStock(currentStock: number): boolean {
    return currentStock <= 0;
  }

  calculateReorderQuantity(product: Product, currentStock: number): number {
    if (currentStock >= product.reorderPoint) {
      return 0;
    }
    
    const deficit = product.reorderPoint - currentStock;
    return Math.max(product.reorderQuantity, deficit);
  }

  aggregateInventoryByProduct(inventory: InventoryItem[]): Map<string, number> {
    const aggregated = new Map<string, number>();
    
    inventory.forEach((item) => {
      const current = aggregated.get(item.productId) || 0;
      aggregated.set(item.productId, current + item.available);
    });
    
    return aggregated;
  }

  getTotalQuantityByProduct(inventory: InventoryItem[]): Map<string, number> {
    const totals = new Map<string, number>();
    
    inventory.forEach((item) => {
      const current = totals.get(item.productId) || 0;
      totals.set(item.productId, current + item.quantity);
    });
    
    return totals;
  }

  getReservedByProduct(inventory: InventoryItem[]): Map<string, number> {
    const reserved = new Map<string, number>();
    
    inventory.forEach((item) => {
      const current = reserved.get(item.productId) || 0;
      reserved.set(item.productId, current + item.reserved);
    });
    
    return reserved;
  }

  calculateStockStatus(product: Product, currentStock: number): 'out_of_stock' | 'low_stock' | 'in_stock' | 'overstocked' {
    if (this.isOutOfStock(currentStock)) {
      return 'out_of_stock';
    }
    
    if (this.isLowStock(product, currentStock)) {
      return 'low_stock';
    }
    
    const optimalStock = product.reorderPoint + product.reorderQuantity;
    if (currentStock > optimalStock * 2) {
      return 'overstocked';
    }
    
    return 'in_stock';
  }

  calculateStockDays(product: Product, currentStock: number, averageDailySales: number): number {
    if (averageDailySales <= 0) {
      return Infinity;
    }
    
    return currentStock / averageDailySales;
  }

  calculateTurnoverRate(soldQuantity: number, averageInventory: number): number {
    if (averageInventory <= 0) {
      return 0;
    }
    
    return soldQuantity / averageInventory;
  }

  calculateInventoryValue(products: Product[], inventory: InventoryItem[], useRetailPrice: boolean = false): number {
    const inventoryMap = new Map<string, number>();
    
    inventory.forEach((item) => {
      const current = inventoryMap.get(item.productId) || 0;
      inventoryMap.set(item.productId, current + item.quantity);
    });

    let totalValue = 0;
    
    products.forEach((product) => {
      const quantity = inventoryMap.get(product.id) || 0;
      const priceToUse = useRetailPrice ? product.price : product.cost;
      totalValue += priceToUse * quantity;
    });

    return totalValue;
  }

  calculatePotentialProfit(products: Product[], inventory: InventoryItem[]): number {
    const inventoryMap = new Map<string, number>();
    
    inventory.forEach((item) => {
      const current = inventoryMap.get(item.productId) || 0;
      inventoryMap.set(item.productId, current + item.quantity);
    });

    let potentialProfit = 0;
    
    products.forEach((product) => {
      const quantity = inventoryMap.get(product.id) || 0;
      const profitPerUnit = product.price - product.cost;
      potentialProfit += profitPerUnit * quantity;
    });

    return potentialProfit;
  }

  getInventoryByChannel(inventory: InventoryItem[], channelId: string): InventoryItem[] {
    return inventory.filter((item) => item.channelId === channelId);
  }

  getInventoryByProduct(inventory: InventoryItem[], productId: string): InventoryItem[] {
    return inventory.filter((item) => item.productId === productId);
  }

  calculateChannelDistribution(inventory: InventoryItem[]): Map<string, { quantity: number; available: number; reserved: number }> {
    const distribution = new Map<string, { quantity: number; available: number; reserved: number }>();
    
    inventory.forEach((item) => {
      const current = distribution.get(item.channelId) || { quantity: 0, available: 0, reserved: 0 };
      distribution.set(item.channelId, {
        quantity: current.quantity + item.quantity,
        available: current.available + item.available,
        reserved: current.reserved + item.reserved,
      });
    });
    
    return distribution;
  }
}

export const InventoryCalculator = new InventoryCalculatorImpl();