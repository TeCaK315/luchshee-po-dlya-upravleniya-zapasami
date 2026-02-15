'use client';

import React, { useState } from 'react';
import { RefreshCw, Plus, Edit2, Trash2, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import type { ChannelSyncProps, SalesChannel } from '@/types';

export function ChannelSync({ channels, onSync, onAdd, onEdit, onDelete, isLoading = false }: ChannelSyncProps) {
  const [syncingChannels, setSyncingChannels] = useState<Set<string>>(new Set());
  const [deletingChannels, setDeletingChannels] = useState<Set<string>>(new Set());

  const handleSync = async (channelId: string) => {
    setSyncingChannels(prev => new Set(prev).add(channelId));
    try {
      await onSync(channelId);
    } finally {
      setSyncingChannels(prev => {
        const next = new Set(prev);
        next.delete(channelId);
        return next;
      });
    }
  };

  const handleDelete = async (channelId: string) => {
    if (!confirm('Are you sure you want to delete this channel? This will remove all associated inventory data.')) {
      return;
    }
    setDeletingChannels(prev => new Set(prev).add(channelId));
    try {
      await onDelete(channelId);
    } finally {
      setDeletingChannels(prev => {
        const next = new Set(prev);
        next.delete(channelId);
        return next;
      });
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
    return icons[type] || '🔗';
  };

  const getStatusColor = (status: SalesChannel['syncStatus']) => {
    switch (status) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'syncing':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: SalesChannel['syncStatus']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'syncing':
        return <Loader2 className="w-5 h-5 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const formatLastSync = (lastSyncedAt: string | null) => {
    if (!lastSyncedAt) return 'Never synced';
    const date = new Date(lastSyncedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Sales Channels</h2>
          <p className="text-gray-400 mt-1">Manage integrations and sync inventory across platforms</p>
        </div>
        <button
          onClick={onAdd}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Channel
        </button>
      </div>

      {channels.length === 0 ? (
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
          <div className="text-6xl mb-4">🔗</div>
          <h3 className="text-xl font-semibold text-white mb-2">No channels connected</h3>
          <p className="text-gray-400 mb-6">Connect your first sales channel to start syncing inventory</p>
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Connect Channel
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.map(channel => {
            const isSyncing = syncingChannels.has(channel.id);
            const isDeleting = deletingChannels.has(channel.id);
            const isChannelLoading = isSyncing || isDeleting;

            return (
              <div
                key={channel.id}
                className="bg-gray-900 rounded-lg border border-gray-800 p-6 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{getChannelIcon(channel.type)}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{channel.name}</h3>
                      <p className="text-sm text-gray-400 capitalize">{channel.type}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 ${getStatusColor(channel.syncStatus)}`}>
                    {getStatusIcon(channel.syncStatus)}
                  </div>
                </div>

                {channel.storeUrl && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Store URL</p>
                    <p className="text-sm text-gray-300 truncate">{channel.storeUrl}</p>
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Status</span>
                    <span className={`font-medium ${channel.isActive ? 'text-green-400' : 'text-gray-500'}`}>
                      {channel.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-400">Last Sync</span>
                    <span className="text-gray-300">{formatLastSync(channel.lastSyncedAt)}</span>
                  </div>
                </div>

                {channel.syncError && (
                  <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg">
                    <p className="text-xs text-red-400">{channel.syncError}</p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSync(channel.id)}
                    disabled={isChannelLoading || !channel.isActive}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
                  >
                    {isSyncing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Sync Now
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => onEdit(channel)}
                    disabled={isChannelLoading}
                    className="p-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    title="Edit channel"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(channel.id)}
                    disabled={isChannelLoading}
                    className="p-2 bg-gray-800 hover:bg-red-900 disabled:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    title="Delete channel"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Sync Information</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium">Automatic Sync</p>
              <p className="text-gray-400">Inventory syncs automatically every 15 minutes for active channels</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <RefreshCw className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium">Manual Sync</p>
              <p className="text-gray-400">Click "Sync Now" to immediately update inventory for a specific channel</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium">Sync Errors</p>
              <p className="text-gray-400">If sync fails, check your API credentials and channel connection status</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}