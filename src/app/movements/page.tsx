'use client';

import React, { useState, useEffect } from 'react';
import { Package, Filter, Calendar, TrendingUp, TrendingDown, RefreshCw, Search, X } from 'lucide-react';
import { StockMovement, Product, SalesChannel, GetStockMovementsResponse, StockMovementFilters } from '@/types';
import Navigation from '@/components/Navigation';

export default function MovementsPage() {
  const [movements, setMovements] = useState<(StockMovement & { product: Product; channel: SalesChannel })[]>([]);
  const [filteredMovements, setFilteredMovements] = useState<(StockMovement & { product: Product; channel: SalesChannel })[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [channels, setChannels] = useState<SalesChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<StockMovementFilters>({
    productId: undefined,
    channelId: undefined,
    type: undefined,
    startDate: undefined,
    endDate: undefined,
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [movements, filters, searchTerm]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [movementsRes, productsRes, channelsRes] = await Promise.all([
        fetch('/api/movements'),
        fetch('/api/products'),
        fetch('/api/channels'),
      ]);

      if (!movementsRes.ok || !productsRes.ok || !channelsRes.ok) {
        throw new Error('Failed to load data');
      }

      const movementsData: GetStockMovementsResponse = await movementsRes.json();
      const productsData = await productsRes.json();
      const channelsData = await channelsRes.json();

      setMovements(movementsData.movements || []);
      setProducts(productsData.products || []);
      setChannels(channelsData.channels || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load movements');
      console.error('Error loading movements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...movements];

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
      filtered = filtered.filter(m => new Date(m.createdAt) >= new Date(filters.startDate!));
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(m => new Date(m.createdAt) <= endDate);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(m => 
        m.product.name.toLowerCase().includes(term) ||
        m.product.sku.toLowerCase().includes(term) ||
        m.channel.name.toLowerCase().includes(term) ||
        m.reference?.toLowerCase().includes(term) ||
        m.reason?.toLowerCase().includes(term)
      );
    }

    setFilteredMovements(filtered);
  };

  const clearFilters = () => {
    setFilters({
      productId: undefined,
      channelId: undefined,
      type: undefined,
      startDate: undefined,
      endDate: undefined,
    });
    setSearchTerm('');
  };

  const getMovementIcon = (type: StockMovement['type']) => {
    switch (type) {
      case 'purchase':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'sale':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      case 'adjustment':
        return <RefreshCw className="w-5 h-5 text-blue-500" />;
      case 'transfer':
        return <Package className="w-5 h-5 text-purple-500" />;
      case 'return':
        return <TrendingUp className="w-5 h-5 text-yellow-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getMovementColor = (type: StockMovement['type']) => {
    switch (type) {
      case 'purchase':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'sale':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'adjustment':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'transfer':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'return':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const hasActiveFilters = filters.productId || filters.channelId || filters.type || filters.startDate || filters.endDate || searchTerm;

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Stock Movements</h1>
          <p className="text-gray-400">Track all inventory transactions and changes</p>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search by product, SKU, channel, reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-750 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                  Active
                </span>
              )}
            </button>

            <button
              onClick={loadData}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-gray-800">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Product</label>
                <select
                  value={filters.productId || ''}
                  onChange={(e) => setFilters({ ...filters, productId: e.target.value || undefined })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Products</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Channel</label>
                <select
                  value={filters.channelId || ''}
                  onChange={(e) => setFilters({ ...filters, channelId: e.target.value || undefined })}
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
                <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value as StockMovement['type'] || undefined })}
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
                <label className="block text-sm font-medium text-gray-400 mb-2">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value || undefined })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">End Date</label>
                <input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value || undefined })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {hasActiveFilters && (
                <div className="md:col-span-2 lg:col-span-5 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : filteredMovements.length === 0 ? (
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No movements found</h3>
            <p className="text-gray-400">
              {hasActiveFilters
                ? 'Try adjusting your filters to see more results'
                : 'Stock movements will appear here as you make transactions'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-400">
                Showing {filteredMovements.length} of {movements.length} movements
              </p>
            </div>

            {filteredMovements.map((movement) => (
              <div
                key={movement.id}
                className="bg-gray-900 rounded-lg border border-gray-800 p-6 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getMovementIcon(movement.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {movement.product.name}
                        </h3>
                        <p className="text-sm text-gray-400">
                          SKU: {movement.product.sku} • Channel: {movement.channel.name}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getMovementColor(movement.type)}`}>
                        {movement.type.charAt(0).toUpperCase() + movement.type.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Quantity Change</p>
                        <p className={`text-lg font-semibold ${movement.quantity >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {movement.quantity >= 0 ? '+' : ''}{movement.quantity}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Previous Stock</p>
                        <p className="text-lg font-semibold text-white">{movement.previousQuantity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">New Stock</p>
                        <p className="text-lg font-semibold text-white">{movement.newQuantity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Date & Time</p>
                        <p className="text-sm text-white">{formatDate(movement.createdAt)}</p>
                      </div>
                    </div>

                    {(movement.reason || movement.reference) && (
                      <div className="flex flex-wrap gap-4 pt-3 border-t border-gray-800">
                        {movement.reason && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Reason</p>
                            <p className="text-sm text-gray-300">{movement.reason}</p>
                          </div>
                        )}
                        {movement.reference && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Reference</p>
                            <p className="text-sm text-gray-300">{movement.reference}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Created By</p>
                          <p className="text-sm text-gray-300">{movement.createdBy}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}