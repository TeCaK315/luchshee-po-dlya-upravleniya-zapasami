'use client';

import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Package, RefreshCw, ArrowRightLeft, RotateCcw, Calendar, Filter, Search } from 'lucide-react';
import type { StockMovementListProps, StockMovementFilters } from '@/types';

export function StockMovementList({
  movements,
  onFilter,
  isLoading = false
}: StockMovementListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<StockMovementFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const products = useMemo(() => {
    const uniqueProducts = new Map();
    movements.forEach(movement => {
      if (!uniqueProducts.has(movement.product.id)) {
        uniqueProducts.set(movement.product.id, movement.product);
      }
    });
    return Array.from(uniqueProducts.values());
  }, [movements]);

  const channels = useMemo(() => {
    const uniqueChannels = new Map();
    movements.forEach(movement => {
      if (!uniqueChannels.has(movement.channel.id)) {
        uniqueChannels.set(movement.channel.id, movement.channel);
      }
    });
    return Array.from(uniqueChannels.values());
  }, [movements]);

  const filteredMovements = useMemo(() => {
    let filtered = movements;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(movement =>
        movement.product.name.toLowerCase().includes(term) ||
        movement.product.sku.toLowerCase().includes(term) ||
        movement.reason?.toLowerCase().includes(term) ||
        movement.reference?.toLowerCase().includes(term)
      );
    }

    if (filters.productId) {
      filtered = filtered.filter(m => m.productId === filters.productId);
    }

    if (filters.channelId) {
      filtered = filtered.filter(m => m.channelId === filters.channelId);
    }

    if (filters.type) {
      filtered = filtered.filter(m => m.type === filters.type);
    }

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(m => new Date(m.createdAt) >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(m => new Date(m.createdAt) <= endDate);
    }

    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [movements, searchTerm, filters]);

  const handleFilterChange = (newFilters: Partial<StockMovementFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilter(updatedFilters);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    onFilter({});
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'sale':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      case 'adjustment':
        return <RefreshCw className="w-5 h-5 text-blue-500" />;
      case 'transfer':
        return <ArrowRightLeft className="w-5 h-5 text-purple-500" />;
      case 'return':
        return <RotateCcw className="w-5 h-5 text-yellow-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'text-green-500 bg-green-500/10';
      case 'sale':
        return 'text-red-500 bg-red-500/10';
      case 'adjustment':
        return 'text-blue-500 bg-blue-500/10';
      case 'transfer':
        return 'text-purple-500 bg-purple-500/10';
      case 'return':
        return 'text-yellow-500 bg-yellow-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatQuantityChange = (quantity: number, type: string) => {
    const isIncrease = ['purchase', 'return'].includes(type);
    const sign = isIncrease ? '+' : '-';
    const color = isIncrease ? 'text-green-500' : 'text-red-500';
    return <span className={`font-semibold ${color}`}>{sign}{Math.abs(quantity)}</span>;
  };

  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="ml-3 text-gray-400">Loading movements...</span>
        </div>
      </div>
    );
  }

  if (movements.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
        <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Stock Movements</h3>
        <p className="text-gray-400">Stock movements will appear here as you manage your inventory.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800">
      <div className="p-4 border-b border-gray-800">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search by product, SKU, reason, or reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  showFilters 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>
              
              {(Object.keys(filters).length > 0 || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-800/50 rounded-lg">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">Product</label>
                <select
                  value={filters.productId || ''}
                  onChange={(e) => handleFilterChange({ productId: e.target.value || undefined })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Products</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">Channel</label>
                <select
                  value={filters.channelId || ''}
                  onChange={(e) => handleFilterChange({ channelId: e.target.value || undefined })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Channels</option>
                  {channels.map(channel => (
                    <option key={channel.id} value={channel.id}>
                      {channel.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">Type</label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => handleFilterChange({ type: e.target.value as any || undefined })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="purchase">Purchase</option>
                  <option value="sale">Sale</option>
                  <option value="adjustment">Adjustment</option>
                  <option value="transfer">Transfer</option>
                  <option value="return">Return</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">Date Range</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => handleFilterChange({ startDate: e.target.value || undefined })}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => handleFilterChange({ endDate: e.target.value || undefined })}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-800">
        {filteredMovements.map((movement) => (
          <div key={movement.id} className="p-4 hover:bg-gray-800/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                {getMovementIcon(movement.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-white">{movement.product.name}</h4>
                      <span className="text-xs font-mono text-gray-500">{movement.product.sku}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{movement.channel.name}</span>
                      <span>•</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${getMovementColor(movement.type)}`}>
                        {movement.type.charAt(0).toUpperCase() + movement.type.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-semibold text-white mb-1">
                      {formatQuantityChange(movement.quantity, movement.type)} units
                    </div>
                    <div className="text-xs text-gray-500">
                      {movement.previousQuantity} → {movement.newQuantity}
                    </div>
                  </div>
                </div>

                {(movement.reason || movement.reference) && (
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-2">
                    {movement.reason && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Reason:</span>
                        <span>{movement.reason}</span>
                      </div>
                    )}
                    {movement.reference && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Ref:</span>
                        <span className="font-mono">{movement.reference}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(movement.createdAt)}</span>
                  </div>
                  <span>•</span>
                  <span>by {movement.createdBy}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMovements.length === 0 && (
        <div className="p-12 text-center">
          <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No movements match your filters.</p>
        </div>
      )}

      <div className="px-6 py-4 border-t border-gray-800 bg-gray-800/30">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>
            Showing {filteredMovements.length} of {movements.length} movements
          </span>
          <span>
            Total Change: {filteredMovements.reduce((sum, m) => {
              const isIncrease = ['purchase', 'return'].includes(m.type);
              return sum + (isIncrease ? m.quantity : -m.quantity);
            }, 0)} units
          </span>
        </div>
      </div>
    </div>
  );
}