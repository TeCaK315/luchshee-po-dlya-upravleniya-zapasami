'use client';

import React from 'react';
import { Package, TrendingDown, TrendingUp, AlertTriangle, DollarSign, Activity, ShoppingCart } from 'lucide-react';
import type { DashboardStatsProps } from '@/types';

export function DashboardStats({ stats, isLoading = false }: DashboardStatsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'sale':
        return <ShoppingCart className="w-4 h-4 text-blue-400" />;
      case 'adjustment':
        return <Activity className="w-4 h-4 text-yellow-400" />;
      case 'transfer':
        return <Package className="w-4 h-4 text-purple-400" />;
      case 'return':
        return <TrendingDown className="w-4 h-4 text-orange-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'text-green-400';
      case 'sale':
        return 'text-blue-400';
      case 'adjustment':
        return 'text-yellow-400';
      case 'transfer':
        return 'text-purple-400';
      case 'return':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-900 rounded-lg border border-gray-800 p-6 animate-pulse">
              <div className="h-4 bg-gray-800 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-800 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-900/30 rounded-lg">
              <Package className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Total Products</p>
            <p className="text-3xl font-bold text-white">{formatNumber(stats.totalProducts)}</p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Total Inventory Value</p>
            <p className="text-3xl font-bold text-white">{formatCurrency(stats.totalValue)}</p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-yellow-900/30 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Low Stock Items</p>
            <p className="text-3xl font-bold text-white">{formatNumber(stats.lowStockCount)}</p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-900/30 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-400" />
            </div>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Out of Stock</p>
            <p className="text-3xl font-bold text-white">{formatNumber(stats.outOfStockCount)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Movements</h3>
          {stats.recentMovements.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400">No recent movements</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentMovements.slice(0, 5).map(movement => (
                <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getMovementIcon(movement.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {movement.type.charAt(0).toUpperCase() + movement.type.slice(1)}
                      </p>
                      <p className="text-gray-400 text-xs truncate">
                        {movement.reference || 'No reference'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <p className={`text-sm font-semibold ${getMovementColor(movement.type)}`}>
                      {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                    </p>
                    <p className="text-gray-500 text-xs">{formatDate(movement.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Products by Value</h3>
          {stats.topProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400">No products yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.topProducts.slice(0, 5).map((item, index) => (
                <div key={item.product.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm font-semibold text-gray-300">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-gray-400 text-xs">{item.product.sku}</p>
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <p className="text-white text-sm font-semibold">{formatCurrency(item.totalValue)}</p>
                    <p className="text-gray-400 text-xs">{formatNumber(item.totalQuantity)} units</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Channel Statistics</h3>
        {stats.channelStats.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400">No channels connected</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.channelStats.map(channelStat => (
              <div key={channelStat.channel.id} className="p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium">{channelStat.channel.name}</h4>
                  <span className={`text-xs px-2 py-1 rounded ${
                    channelStat.channel.isActive 
                      ? 'bg-green-900/30 text-green-400' 
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {channelStat.channel.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Products</span>
                    <span className="text-white font-medium">{formatNumber(channelStat.productCount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Total Stock</span>
                    <span className="text-white font-medium">{formatNumber(channelStat.totalQuantity)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}