'use client';

import React, { useState, useMemo } from 'react';
import { Package, RefreshCw, Edit, Trash2, AlertTriangle, Search, Filter } from 'lucide-react';
import type { InventoryTableProps } from '@/types';

export function InventoryTable({
  inventory,
  onEdit,
  onDelete,
  onSync,
  isLoading = false
}: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'sku' | 'quantity' | 'available'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const channels = useMemo(() => {
    const uniqueChannels = new Map();
    inventory.forEach(item => {
      if (!uniqueChannels.has(item.channel.id)) {
        uniqueChannels.set(item.channel.id, item.channel);
      }
    });
    return Array.from(uniqueChannels.values());
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    let filtered = inventory;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.product.name.toLowerCase().includes(term) ||
        item.product.sku.toLowerCase().includes(term) ||
        item.product.category.toLowerCase().includes(term)
      );
    }

    if (selectedChannel !== 'all') {
      filtered = filtered.filter(item => item.channelId === selectedChannel);
    }

    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'name':
          aValue = a.product.name.toLowerCase();
          bValue = b.product.name.toLowerCase();
          break;
        case 'sku':
          aValue = a.product.sku.toLowerCase();
          bValue = b.product.sku.toLowerCase();
          break;
        case 'quantity':
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case 'available':
          aValue = a.available;
          bValue = b.available;
          break;
        default:
          aValue = a.product.name.toLowerCase();
          bValue = b.product.name.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [inventory, searchTerm, selectedChannel, sortBy, sortOrder]);

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getStockStatus = (item: typeof inventory[0]) => {
    const stockPercentage = (item.available / item.product.reorderPoint) * 100;
    
    if (item.available === 0) {
      return { label: 'Out of Stock', color: 'text-red-500', bgColor: 'bg-red-500/10' };
    } else if (item.available <= item.product.reorderPoint) {
      return { label: 'Low Stock', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' };
    } else if (stockPercentage < 150) {
      return { label: 'Normal', color: 'text-blue-500', bgColor: 'bg-blue-500/10' };
    } else {
      return { label: 'In Stock', color: 'text-green-500', bgColor: 'bg-green-500/10' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="ml-3 text-gray-400">Loading inventory...</span>
        </div>
      </div>
    );
  }

  if (inventory.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
        <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Inventory Items</h3>
        <p className="text-gray-400">Start by adding products to track your inventory.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800">
      <div className="p-4 border-b border-gray-800">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name, SKU, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="pl-10 pr-8 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                <option value="all">All Channels</option>
                {channels.map(channel => (
                  <option key={channel.id} value={channel.id}>
                    {channel.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800/50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                onClick={() => handleSort('sku')}
              >
                <div className="flex items-center gap-2">
                  SKU
                  {sortBy === 'sku' && (
                    <span className="text-blue-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  Product
                  {sortBy === 'name' && (
                    <span className="text-blue-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Channel
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                onClick={() => handleSort('quantity')}
              >
                <div className="flex items-center gap-2">
                  Total Stock
                  {sortBy === 'quantity' && (
                    <span className="text-blue-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Reserved
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                onClick={() => handleSort('available')}
              >
                <div className="flex items-center gap-2">
                  Available
                  {sortBy === 'available' && (
                    <span className="text-blue-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Last Synced
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredInventory.map((item) => {
              const status = getStockStatus(item);
              const needsReorder = item.available <= item.product.reorderPoint;

              return (
                <tr key={item.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-gray-300">{item.product.sku}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">{item.product.name}</span>
                      <span className="text-xs text-gray-500">{item.product.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-300">{item.channel.name}</span>
                      {item.channel.syncStatus === 'syncing' && (
                        <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                      )}
                      {item.channel.syncStatus === 'error' && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-white">{item.quantity}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-400">{item.reserved}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{item.available}</span>
                      {needsReorder && (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" title="Below reorder point" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs text-gray-500">{formatDate(item.lastSyncedAt)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onSync(item.channelId)}
                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded transition-colors"
                        title="Sync inventory"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded transition-colors"
                        title="Edit inventory"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                        title="Delete inventory"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredInventory.length === 0 && (
        <div className="p-12 text-center">
          <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No inventory items match your filters.</p>
        </div>
      )}

      <div className="px-6 py-4 border-t border-gray-800 bg-gray-800/30">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>
            Showing {filteredInventory.length} of {inventory.length} items
          </span>
          <span>
            Total Stock: {filteredInventory.reduce((sum, item) => sum + item.quantity, 0)} units
          </span>
        </div>
      </div>
    </div>
  );
}