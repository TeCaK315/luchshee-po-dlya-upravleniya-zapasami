'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Package, AlertCircle } from 'lucide-react';
import { Product, CreateProductRequest, UpdateProductRequest, InventoryItem, SalesChannel } from '@/types';
import Navigation from '@/components/Navigation';
import ProductForm from '@/components/ProductForm';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [channels, setChannels] = useState<SalesChannel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [productsRes, inventoryRes, channelsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/inventory'),
        fetch('/api/channels')
      ]);

      if (!productsRes.ok || !inventoryRes.ok || !channelsRes.ok) {
        throw new Error('Failed to load data');
      }

      const productsData = await productsRes.json();
      const inventoryData = await inventoryRes.json();
      const channelsData = await channelsRes.json();

      setProducts(productsData.products || []);
      setInventory(inventoryData.inventory || []);
      setChannels(channelsData.channels || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProduct = async (data: CreateProductRequest) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to create product');
      }

      const result = await response.json();
      setProducts(prev => [...prev, result.product]);
      if (result.inventory) {
        setInventory(prev => [...prev, ...result.inventory]);
      }
      setIsFormOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async (data: UpdateProductRequest) => {
    if (!editingProduct) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      const result = await response.json();
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? result.product : p));
      setIsFormOpen(false);
      setEditingProduct(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    setError(null);
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      setProducts(prev => prev.filter(p => p.id !== productId));
      setInventory(prev => prev.filter(i => i.productId !== productId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  const getProductStock = (productId: string): number => {
    return inventory
      .filter(i => i.productId === productId)
      .reduce((sum, i) => sum + i.available, 0);
  };

  const isLowStock = (product: Product, stock: number): boolean => {
    return stock <= product.reorderPoint && stock > 0;
  };

  const isOutOfStock = (stock: number): boolean => {
    return stock === 0;
  };

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Products</h1>
            <p className="text-gray-400">Manage your product catalog and inventory</p>
          </div>
          <button
            onClick={() => {
              setEditingProduct(undefined);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-gray-900 rounded-lg p-12 text-center">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Get started by adding your first product'}
            </p>
            {!searchQuery && selectedCategory === 'all' && (
              <button
                onClick={() => {
                  setEditingProduct(undefined);
                  setIsFormOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Add Your First Product
              </button>
            )}
          </div>
        ) : (
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredProducts.map(product => {
                    const stock = getProductStock(product.id);
                    const lowStock = isLowStock(product, stock);
                    const outOfStock = isOutOfStock(stock);

                    return (
                      <tr key={product.id} className="hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-white">{product.name}</div>
                            <div className="text-sm text-gray-400 truncate max-w-xs">
                              {product.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-300 font-mono">{product.sku}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-300">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-white">${product.price.toFixed(2)}</div>
                          <div className="text-xs text-gray-400">Cost: ${product.cost.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-white">{stock} units</div>
                          <div className="text-xs text-gray-400">
                            Reorder at {product.reorderPoint}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {outOfStock ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/20 text-red-400">
                              Out of Stock
                            </span>
                          ) : lowStock ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/20 text-yellow-400">
                              Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/20 text-green-400">
                              In Stock
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingProduct(product);
                                setIsFormOpen(true);
                              }}
                              className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-colors"
                              title="Edit product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                              title="Delete product"
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
          </div>
        )}

        <div className="mt-6 flex items-center justify-between text-sm text-gray-400">
          <div>
            Showing {filteredProducts.length} of {products.length} products
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>In Stock</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Low Stock</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Out of Stock</span>
            </div>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <ProductForm
                product={editingProduct}
                onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
                onCancel={() => {
                  setIsFormOpen(false);
                  setEditingProduct(undefined);
                }}
                isLoading={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}