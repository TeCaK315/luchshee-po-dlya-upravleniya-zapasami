'use client';

import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingUp, RefreshCw, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { 
  Product, 
  InventoryItem, 
  SalesChannel, 
  StockMovement,
  DashboardStats,
  GetDashboardStatsResponse,
  GetInventoryResponse,
  SyncInventoryRequest,
  SyncInventoryResponse
} from '@/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [inventory, setInventory] = useState<(InventoryItem & { product: Product; channel: SalesChannel })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsRes, inventoryRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/inventory')
      ]);

      if (!statsRes.ok || !inventoryRes.ok) {
        throw new Error('Failed to load dashboard data');
      }

      const statsData: GetDashboardStatsResponse = await statsRes.json();
      const inventoryData: GetInventoryResponse = await inventoryRes.json();

      if (statsData.success) {
        setStats(statsData.stats);
      }

      if (inventoryData.success) {
        setInventory(inventoryData.inventory);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async (channelId: string) => {
    setIsSyncing(channelId);
    try {
      const request: SyncInventoryRequest = { channelId };
      const response = await fetch('/api/inventory/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error('Sync failed');
      }

      const data: SyncInventoryResponse = await response.json();
      
      if (data.success) {
        await loadDashboardData();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setIsSyncing(null);
    }
  };

  const getLowStockProducts = () => {
    if (!stats) return [];
    
    const productStockMap = new Map<string, number>();
    inventory.forEach(item => {
      const current = productStockMap.get(item.productId) || 0;
      productStockMap.set(item.productId, current + item.available);
    });

    return inventory
      .filter(item => {
        const totalStock = productStockMap.get(item.productId) || 0;
        return totalStock <= item.product.reorderPoint && totalStock > 0;
      })
      .reduce((acc, item) => {
        if (!acc.find(p => p.id === item.product.id)) {
          acc.push({
            ...item.product,
            currentStock: productStockMap.get(item.product.id) || 0
          });
        }
        return acc;
      }, [] as (Product & { currentStock: number })[])
      .slice(0, 5);
  };

  const getOutOfStockProducts = () => {
    if (!stats) return [];
    
    const productStockMap = new Map<string, number>();
    inventory.forEach(item => {
      const current = productStockMap.get(item.productId) || 0;
      productStockMap.set(item.productId, current + item.available);
    });

    return inventory
      .filter(item => {
        const totalStock = productStockMap.get(item.productId) || 0;
        return totalStock === 0;
      })
      .reduce((acc, item) => {
        if (!acc.find(p => p.id === item.product.id)) {
          acc.push(item.product);
        }
        return acc;
      }, [] as Product[])
      .slice(0, 5);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 max-w-md">
          <p className="text-red-400">{error}</p>
          <button
            onClick={loadDashboardData}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const lowStockProducts = getLowStockProducts();
  const outOfStockProducts = getOutOfStockProducts();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Dashboard</h1>
          <p className="text-gray-400 mt-1">Real-time inventory management and analytics</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadDashboardData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => window.location.href = '/products'}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Products</p>
              <p className="text-3xl font-bold mt-2">{stats?.totalProducts || 0}</p>
            </div>
            <div className="bg-blue-500/10 p-3 rounded-lg">
              <Package className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Value</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(stats?.totalValue || 0)}</p>
            </div>
            <div className="bg-green-500/10 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Low Stock</p>
              <p className="text-3xl font-bold mt-2 text-yellow-500">{stats?.lowStockCount || 0}</p>
            </div>
            <div className="bg-yellow-500/10 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Out of Stock</p>
              <p className="text-3xl font-bold mt-2 text-red-500">{stats?.outOfStockCount || 0}</p>
            </div>
            <div className="bg-red-500/10 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-lg border border-gray-800">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-semibold">Low Stock Alerts</h2>
          </div>
          <div className="p-6">
            {lowStockProducts.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No low stock items</p>
            ) : (
              <div className="space-y-4">
                {lowStockProducts.map(product => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-400">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-500 font-semibold">{product.currentStock} units</p>
                      <p className="text-xs text-gray-400">Reorder at {product.reorderPoint}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-semibold">Out of Stock</h2>
          </div>
          <div className="p-6">
            {outOfStockProducts.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No out of stock items</p>
            ) : (
              <div className="space-y-4">
                {outOfStockProducts.map(product => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-400">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-500 font-semibold">0 units</p>
                      <p className="text-xs text-gray-400">Order {product.reorderQuantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold">Recent Stock Movements</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {stats?.recentMovements && stats.recentMovements.length > 0 ? (
                stats.recentMovements.slice(0, 10).map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{movement.productId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        movement.type === 'purchase' ? 'bg-green-500/10 text-green-500' :
                        movement.type === 'sale' ? 'bg-blue-500/10 text-blue-500' :
                        movement.type === 'adjustment' ? 'bg-yellow-500/10 text-yellow-500' :
                        movement.type === 'return' ? 'bg-purple-500/10 text-purple-500' :
                        'bg-gray-500/10 text-gray-500'
                      }`}>
                        {movement.type === 'purchase' && <ArrowUpRight className="w-3 h-3" />}
                        {movement.type === 'sale' && <ArrowDownRight className="w-3 h-3" />}
                        {movement.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        movement.quantity > 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {formatDate(movement.createdAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                    No recent movements
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold">Sales Channels</h2>
        </div>
        <div className="p-6">
          {stats?.channelStats && stats.channelStats.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.channelStats.map(({ channel, productCount, totalQuantity }) => (
                <div key={channel.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium">{channel.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{channel.type}</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      channel.syncStatus === 'success' ? 'bg-green-500' :
                      channel.syncStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' :
                      channel.syncStatus === 'error' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{productCount} products</span>
                    <span className="text-gray-400">{totalQuantity} units</span>
                  </div>
                  {channel.lastSyncedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Last synced: {formatDate(channel.lastSyncedAt)}
                    </p>
                  )}
                  <button
                    onClick={() => handleSync(channel.id)}
                    disabled={isSyncing === channel.id}
                    className="w-full mt-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    {isSyncing === channel.id ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3" />
                        Sync Now
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No sales channels connected</p>
              <button
                onClick={() => window.location.href = '/channels'}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Connect Channel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}