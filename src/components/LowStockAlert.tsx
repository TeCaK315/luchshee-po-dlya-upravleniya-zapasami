'use client';

import React from 'react';
import { AlertTriangle, Package, TrendingDown, ShoppingCart } from 'lucide-react';
import type { LowStockAlertProps } from '@/types';

export function LowStockAlert({ products, onReorder }: LowStockAlertProps) {
  if (products.length === 0) {
    return null;
  }

  const criticalProducts = products.filter(p => p.currentStock === 0);
  const lowStockProducts = products.filter(p => p.currentStock > 0 && p.currentStock <= p.reorderPoint);

  return (
    <div className="space-y-4">
      {criticalProducts.length > 0 && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-red-400 font-semibold mb-2">
                Out of Stock ({criticalProducts.length})
              </h3>
              <div className="space-y-3">
                {criticalProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-gray-900/50 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-white font-medium">{product.name}</span>
                        <span className="text-gray-500 text-sm">({product.sku})</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-red-400 font-semibold">
                          Stock: 0
                        </span>
                        <span className="text-gray-400">
                          Reorder Point: {product.reorderPoint}
                        </span>
                        <span className="text-gray-400">
                          Suggested: {product.reorderQuantity} units
                        </span>
                      </div>
                      {product.channels.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {product.channels.map((ch) => (
                            <span
                              key={ch.channel.id}
                              className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded"
                            >
                              {ch.channel.name}: {ch.quantity}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => onReorder(product.id)}
                      className="ml-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Reorder Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {lowStockProducts.length > 0 && (
        <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <TrendingDown className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-yellow-400 font-semibold mb-2">
                Low Stock Warning ({lowStockProducts.length})
              </h3>
              <div className="space-y-3">
                {lowStockProducts.map((product) => {
                  const stockPercentage = (product.currentStock / product.reorderPoint) * 100;
                  const isVeryLow = stockPercentage < 50;

                  return (
                    <div
                      key={product.id}
                      className="bg-gray-900/50 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-white font-medium">{product.name}</span>
                          <span className="text-gray-500 text-sm">({product.sku})</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm mb-2">
                          <span className={`font-semibold ${isVeryLow ? 'text-orange-400' : 'text-yellow-400'}`}>
                            Stock: {product.currentStock}
                          </span>
                          <span className="text-gray-400">
                            Reorder Point: {product.reorderPoint}
                          </span>
                          <span className="text-gray-400">
                            Suggested: {product.reorderQuantity} units
                          </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isVeryLow ? 'bg-orange-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                          />
                        </div>
                        {product.channels.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {product.channels.map((ch) => (
                              <span
                                key={ch.channel.id}
                                className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded"
                              >
                                {ch.channel.name}: {ch.quantity}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => onReorder(product.id)}
                        className="ml-4 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Reorder
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-400">Out of Stock: {criticalProducts.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-400">Low Stock: {lowStockProducts.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
              <span className="text-gray-400">Total Alerts: {products.length}</span>
            </div>
          </div>
          <div className="text-gray-500">
            Review and reorder products to maintain optimal stock levels
          </div>
        </div>
      </div>
    </div>
  );
}