'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Package, DollarSign, AlertCircle } from 'lucide-react';
import { Product, CreateProductRequest, UpdateProductRequest, ProductFormProps, SalesChannel } from '@/types';

export function ProductForm({ product, onSubmit, onCancel, isLoading = false }: ProductFormProps) {
  const [formData, setFormData] = useState<CreateProductRequest>({
    sku: '',
    name: '',
    description: '',
    category: '',
    price: 0,
    cost: 0,
    reorderPoint: 10,
    reorderQuantity: 50,
    initialStock: [],
  });

  const [channels, setChannels] = useState<SalesChannel[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadChannels();
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku,
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        cost: product.cost,
        reorderPoint: product.reorderPoint,
        reorderQuantity: product.reorderQuantity,
      });
    }
  }, [product]);

  const loadChannels = async () => {
    try {
      const response = await fetch('/api/channels');
      if (response.ok) {
        const data = await response.json();
        setChannels(data.channels || []);
        
        if (!product && data.channels.length > 0) {
          setFormData(prev => ({
            ...prev,
            initialStock: data.channels.map((ch: SalesChannel) => ({
              channelId: ch.id,
              quantity: 0,
            })),
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load channels:', error);
    }
  };

  const validateField = (name: string, value: string | number): string => {
    switch (name) {
      case 'sku':
        if (!value || String(value).trim() === '') return 'SKU is required';
        if (String(value).length < 2) return 'SKU must be at least 2 characters';
        return '';
      case 'name':
        if (!value || String(value).trim() === '') return 'Product name is required';
        if (String(value).length < 3) return 'Name must be at least 3 characters';
        return '';
      case 'category':
        if (!value || String(value).trim() === '') return 'Category is required';
        return '';
      case 'price':
        if (Number(value) < 0) return 'Price cannot be negative';
        return '';
      case 'cost':
        if (Number(value) < 0) return 'Cost cannot be negative';
        return '';
      case 'reorderPoint':
        if (Number(value) < 0) return 'Reorder point cannot be negative';
        return '';
      case 'reorderQuantity':
        if (Number(value) <= 0) return 'Reorder quantity must be greater than 0';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericFields = ['price', 'cost', 'reorderPoint', 'reorderQuantity'];
    const newValue = numericFields.includes(name) ? parseFloat(value) || 0 : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }));

    if (touched[name]) {
      const error = validateField(name, newValue);
      setErrors(prev => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleStockChange = (channelId: string, quantity: number) => {
    setFormData(prev => ({
      ...prev,
      initialStock: prev.initialStock?.map(stock =>
        stock.channelId === channelId
          ? { ...stock, quantity: Math.max(0, quantity) }
          : stock
      ) || [],
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const fields = ['sku', 'name', 'category', 'price', 'cost', 'reorderPoint', 'reorderQuantity'];

    fields.forEach(field => {
      const error = validateField(field, formData[field as keyof CreateProductRequest] as string | number);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    setTouched(
      fields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
    );

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (product) {
        const updateData: UpdateProductRequest = {
          sku: formData.sku,
          name: formData.name,
          description: formData.description,
          category: formData.category,
          price: formData.price,
          cost: formData.cost,
          reorderPoint: formData.reorderPoint,
          reorderQuantity: formData.reorderQuantity,
        };
        await onSubmit(updateData);
      } else {
        await onSubmit(formData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const categories = [
    'Electronics',
    'Clothing',
    'Food & Beverage',
    'Home & Garden',
    'Sports & Outdoors',
    'Books & Media',
    'Toys & Games',
    'Health & Beauty',
    'Automotive',
    'Office Supplies',
    'Other',
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-800 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="w-6 h-6" />
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-gray-300 mb-2">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                  errors.sku && touched.sku ? 'border-red-500' : 'border-gray-700'
                }`}
                placeholder="e.g., PROD-001"
              />
              {errors.sku && touched.sku && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.sku}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                  errors.name && touched.name ? 'border-red-500' : 'border-gray-700'
                }`}
                placeholder="e.g., Wireless Mouse"
              />
              {errors.name && touched.name && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isLoading}
              rows={3}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder="Product description..."
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                errors.category && touched.category ? 'border-red-500' : 'border-gray-700'
              }`}
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && touched.category && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.category}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">
                Price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                  step="0.01"
                  min="0"
                  className={`w-full pl-10 pr-4 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                    errors.price && touched.price ? 'border-red-500' : 'border-gray-700'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.price && touched.price && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.price}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="cost" className="block text-sm font-medium text-gray-300 mb-2">
                Cost <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="number"
                  id="cost"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                  step="0.01"
                  min="0"
                  className={`w-full pl-10 pr-4 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                    errors.cost && touched.cost ? 'border-red-500' : 'border-gray-700'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.cost && touched.cost && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.cost}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="reorderPoint" className="block text-sm font-medium text-gray-300 mb-2">
                Reorder Point <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="reorderPoint"
                name="reorderPoint"
                value={formData.reorderPoint}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                min="0"
                className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                  errors.reorderPoint && touched.reorderPoint ? 'border-red-500' : 'border-gray-700'
                }`}
                placeholder="10"
              />
              {errors.reorderPoint && touched.reorderPoint && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.reorderPoint}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">Alert when stock falls below this level</p>
            </div>

            <div>
              <label htmlFor="reorderQuantity" className="block text-sm font-medium text-gray-300 mb-2">
                Reorder Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="reorderQuantity"
                name="reorderQuantity"
                value={formData.reorderQuantity}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                min="1"
                className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                  errors.reorderQuantity && touched.reorderQuantity ? 'border-red-500' : 'border-gray-700'
                }`}
                placeholder="50"
              />
              {errors.reorderQuantity && touched.reorderQuantity && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.reorderQuantity}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">Suggested quantity to reorder</p>
            </div>
          </div>

          {!product && channels.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Initial Stock by Channel
              </label>
              <div className="space-y-3">
                {channels.map(channel => {
                  const stockItem = formData.initialStock?.find(s => s.channelId === channel.id);
                  return (
                    <div key={channel.id} className="flex items-center gap-4 bg-gray-800 p-3 rounded-lg">
                      <span className="flex-1 text-white">{channel.name}</span>
                      <input
                        type="number"
                        value={stockItem?.quantity || 0}
                        onChange={(e) => handleStockChange(channel.id, parseInt(e.target.value) || 0)}
                        disabled={isLoading}
                        min="0"
                        className="w-32 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-800">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {isLoading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}