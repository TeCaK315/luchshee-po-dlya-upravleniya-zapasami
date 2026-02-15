'use client';

import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Settings, Trash2, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { SalesChannel, CreateChannelRequest, SyncInventoryRequest } from '@/types';
import Navigation from '@/components/Navigation';

export default function ChannelsPage() {
  const [channels, setChannels] = useState<SalesChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncingChannels, setSyncingChannels] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newChannel, setNewChannel] = useState<CreateChannelRequest>({
    name: '',
    type: 'manual',
    apiKey: '',
    apiSecret: '',
    storeUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/channels');
      if (!response.ok) {
        throw new Error('Failed to load channels');
      }
      const data = await response.json();
      setChannels(data.channels || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load channels');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncChannel = async (channelId: string) => {
    setSyncingChannels(prev => new Set(prev).add(channelId));
    setError(null);
    
    try {
      const syncRequest: SyncInventoryRequest = {
        channelId
      };

      const response = await fetch('/api/inventory/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(syncRequest)
      });

      if (!response.ok) {
        throw new Error('Failed to sync channel');
      }

      const result = await response.json();
      
      setChannels(prev => prev.map(ch => 
        ch.id === channelId 
          ? { 
              ...ch, 
              lastSyncedAt: result.lastSyncedAt,
              syncStatus: 'success',
              syncError: undefined
            }
          : ch
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync channel');
      setChannels(prev => prev.map(ch => 
        ch.id === channelId 
          ? { ...ch, syncStatus: 'error', syncError: err instanceof Error ? err.message : 'Sync failed' }
          : ch
      ));
    } finally {
      setSyncingChannels(prev => {
        const next = new Set(prev);
        next.delete(channelId);
        return next;
      });
    }
  };

  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newChannel)
      });

      if (!response.ok) {
        throw new Error('Failed to add channel');
      }

      const result = await response.json();
      setChannels(prev => [...prev, result.channel]);
      setIsAddFormOpen(false);
      setNewChannel({
        name: '',
        type: 'manual',
        apiKey: '',
        apiSecret: '',
        storeUrl: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add channel');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteChannel = async (channelId: string) => {
    if (!confirm('Are you sure you want to delete this channel? This will remove all associated inventory data.')) {
      return;
    }

    setError(null);
    try {
      const response = await fetch(`/api/channels/${channelId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete channel');
      }

      setChannels(prev => prev.filter(ch => ch.id !== channelId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete channel');
    }
  };

  const getChannelIcon = (type: SalesChannel['type']) => {
    const icons: Record<SalesChannel['type'], string> = {
      shopify: '🛍️',
      woocommerce: '🛒',
      amazon: '📦',
      ebay: '🏷️',
      manual: '📝'
    };
    return icons[type] || '📝';
  };

  const getStatusColor = (status: SalesChannel['syncStatus']) => {
    switch (status) {
      case 'success':
        return 'text-green-400 bg-green-900/20';
      case 'error':
        return 'text-red-400 bg-red-900/20';
      case 'syncing':
        return 'text-blue-400 bg-blue-900/20';
      default:
        return 'text-gray-400 bg-gray-800';
    }
  };

  const getStatusIcon = (status: SalesChannel['syncStatus']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
        return <XCircle className="w-4 h-4" />;
      case 'syncing':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatLastSync = (lastSyncedAt: string | null) => {
    if (!lastSyncedAt) return 'Never synced';
    const date = new Date(lastSyncedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading channels...</p>
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
            <h1 className="text-3xl font-bold text-white mb-2">Sales Channels</h1>
            <p className="text-gray-400">Manage integrations and sync inventory across platforms</p>
          </div>
          <button
            onClick={() => setIsAddFormOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Channel
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {channels.length === 0 ? (
          <div className="bg-gray-900 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">🔌</div>
            <h3 className="text-xl font-semibold text-white mb-2">No channels connected</h3>
            <p className="text-gray-400 mb-6">
              Connect your sales channels to sync inventory automatically
            </p>
            <button
              onClick={() => setIsAddFormOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Connect Your First Channel
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {channels.map(channel => {
              const isSyncing = syncingChannels.has(channel.id);
              
              return (
                <div
                  key={channel.id}
                  className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{getChannelIcon(channel.type)}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{channel.name}</h3>
                        <p className="text-sm text-gray-400 capitalize">{channel.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSyncChannel(channel.id)}
                        disabled={isSyncing || !channel.isActive}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Sync inventory"
                      >
                        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleDeleteChannel(channel.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                        title="Delete channel"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Status</span>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(channel.syncStatus)}`}>
                        {getStatusIcon(channel.syncStatus)}
                        <span className="capitalize">{channel.syncStatus}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Active</span>
                      <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        channel.isActive 
                          ? 'bg-green-900/20 text-green-400' 
                          : 'bg-gray-800 text-gray-400'
                      }`}>
                        {channel.isActive ? 'Yes' : 'No'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Last Sync</span>
                      <span className="text-sm text-white">
                        {formatLastSync(channel.lastSyncedAt)}
                      </span>
                    </div>

                    {channel.syncError && (
                      <div className="mt-3 p-3 bg-red-900/10 border border-red-900/30 rounded-lg">
                        <p className="text-xs text-red-400">{channel.syncError}</p>
                      </div>
                    )}

                    {channel.storeUrl && (
                      <div className="mt-3 pt-3 border-t border-gray-800">
                        <p className="text-xs text-gray-400 truncate">
                          {channel.storeUrl}
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleSyncChannel(channel.id)}
                    disabled={isSyncing || !channel.isActive}
                    className="w-full mt-4 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSyncing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Sync Now
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 bg-gray-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Supported Platforms</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {(['shopify', 'woocommerce', 'amazon', 'ebay', 'manual'] as const).map(type => (
              <div key={type} className="flex items-center gap-2 text-gray-400">
                <span className="text-2xl">{getChannelIcon(type)}</span>
                <span className="text-sm capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isAddFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Add Sales Channel</h2>
              
              <form onSubmit={handleAddChannel} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Channel Name
                  </label>
                  <input
                    type="text"
                    value={newChannel.name}
                    onChange={(e) => setNewChannel(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="My Store"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Platform Type
                  </label>
                  <select
                    value={newChannel.type}
                    onChange={(e) => setNewChannel(prev => ({ ...prev, type: e.target.value as CreateChannelRequest['type'] }))}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="manual">Manual</option>
                    <option value="shopify">Shopify</option>
                    <option value="woocommerce">WooCommerce</option>
                    <option value="amazon">Amazon</option>
                    <option value="ebay">eBay</option>
                  </select>
                </div>

                {newChannel.type !== 'manual' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Store URL
                      </label>
                      <input
                        type="url"
                        value={newChannel.storeUrl}
                        onChange={(e) => setNewChannel(prev => ({ ...prev, storeUrl: e.target.value }))}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://mystore.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        API Key
                      </label>
                      <input
                        type="text"
                        value={newChannel.apiKey}
                        onChange={(e) => setNewChannel(prev => ({ ...prev, apiKey: e.target.value }))}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter API key"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        API Secret
                      </label>
                      <input
                        type="password"
                        value={newChannel.apiSecret}
                        onChange={(e) => setNewChannel(prev => ({ ...prev, apiSecret: e.target.value }))}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter API secret"
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddFormOpen(false);
                      setNewChannel({
                        name: '',
                        type: 'manual',
                        apiKey: '',
                        apiSecret: '',
                        storeUrl: ''
                      });
                    }}
                    className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Channel'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}