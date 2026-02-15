import { NextRequest, NextResponse } from 'next/server';
import type { GetDashboardStatsResponse, DashboardStats, Product, InventoryItem, StockMovement, SalesChannel } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Get data from localStorage (simulating database)
    const productsData = typeof window !== 'undefined' ? localStorage.getItem('products') : null;
    const inventoryData = typeof window !== 'undefined' ? localStorage.getItem('inventory') : null;
    const movementsData = typeof window !== 'undefined' ? localStorage.getItem('movements') : null;
    const channelsData = typeof window !== 'undefined' ? localStorage.getItem('channels') : null;

    // For server-side, we'll use mock data structure that matches localStorage
    const products: Product[] = productsData ? JSON.parse(productsData) : [];
    const inventory: InventoryItem[] = inventoryData ? JSON.parse(inventoryData) : [];
    const movements: StockMovement[] = movementsData ? JSON.parse(movementsData) : [];
    const channels: SalesChannel[] = channelsData ? JSON.parse(channelsData) : [];

    // Calculate total products
    const totalProducts = products.length;

    // Calculate total inventory value
    const totalValue = products.reduce((sum, product) => {
      const productInventory = inventory.filter(inv => inv.productId === product.id);
      const totalQuantity = productInventory.reduce((qty, inv) => qty + inv.quantity, 0);
      return sum + (totalQuantity * product.price);
    }, 0);

    // Calculate low stock count
    const lowStockCount = products.filter(product => {
      const productInventory = inventory.filter(inv => inv.productId === product.id);
      const totalQuantity = productInventory.reduce((qty, inv) => qty + inv.quantity, 0);
      return totalQuantity > 0 && totalQuantity <= product.reorderPoint;
    }).length;

    // Calculate out of stock count
    const outOfStockCount = products.filter(product => {
      const productInventory = inventory.filter(inv => inv.productId === product.id);
      const totalQuantity = productInventory.reduce((qty, inv) => qty + inv.quantity, 0);
      return totalQuantity === 0;
    }).length;

    // Get recent movements (last 10)
    const recentMovements = movements
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    // Calculate top products by quantity
    const productQuantities = new Map<string, number>();
    inventory.forEach(inv => {
      const current = productQuantities.get(inv.productId) || 0;
      productQuantities.set(inv.productId, current + inv.quantity);
    });

    const topProducts = products
      .map(product => {
        const totalQuantity = productQuantities.get(product.id) || 0;
        return {
          product,
          totalQuantity,
          totalValue: totalQuantity * product.price
        };
      })
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5);

    // Calculate channel statistics
    const channelStats = channels.map(channel => {
      const channelInventory = inventory.filter(inv => inv.channelId === channel.id);
      const productCount = new Set(channelInventory.map(inv => inv.productId)).size;
      const totalQuantity = channelInventory.reduce((sum, inv) => sum + inv.quantity, 0);

      return {
        channel,
        productCount,
        totalQuantity
      };
    });

    const stats: DashboardStats = {
      totalProducts,
      totalValue,
      lowStockCount,
      outOfStockCount,
      recentMovements,
      topProducts,
      channelStats
    };

    const response: GetDashboardStatsResponse = {
      success: true,
      stats
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}