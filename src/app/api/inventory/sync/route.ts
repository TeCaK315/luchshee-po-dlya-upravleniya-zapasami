import { NextRequest, NextResponse } from 'next/server';
import { StorageService } from '@/lib/storage';
import { ChannelIntegrations } from '@/lib/channel-integrations';
import type { SyncInventoryRequest, SyncInventoryResponse, InventoryItem } from '@/types';

const storage = new StorageService();
const channelIntegrations = new ChannelIntegrations();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SyncInventoryRequest;
    const { channelId, productIds } = body;

    if (!channelId) {
      return NextResponse.json(
        {
          success: false,
          syncedCount: 0,
          errors: [{ productId: '', error: 'Channel ID is required' }],
          lastSyncedAt: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Get channel details
    const channels = storage.getChannels();
    const channel = channels.find(c => c.id === channelId);

    if (!channel) {
      return NextResponse.json(
        {
          success: false,
          syncedCount: 0,
          errors: [{ productId: '', error: 'Channel not found' }],
          lastSyncedAt: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    if (!channel.isActive) {
      return NextResponse.json(
        {
          success: false,
          syncedCount: 0,
          errors: [{ productId: '', error: 'Channel is not active' }],
          lastSyncedAt: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Update channel sync status to 'syncing'
    channel.syncStatus = 'syncing';
    channel.syncError = undefined;
    storage.saveChannels(channels);

    // Get products to sync
    const products = storage.getProducts();
    const productsToSync = productIds 
      ? products.filter(p => productIds.includes(p.id))
      : products;

    if (productsToSync.length === 0) {
      channel.syncStatus = 'success';
      channel.lastSyncedAt = new Date().toISOString();
      storage.saveChannels(channels);

      const response: SyncInventoryResponse = {
        success: true,
        syncedCount: 0,
        errors: [],
        lastSyncedAt: channel.lastSyncedAt
      };

      return NextResponse.json(response, { status: 200 });
    }

    // Perform sync with external channel
    const syncResults = await channelIntegrations.syncInventory(
      channel,
      productsToSync.map(p => p.id)
    );

    // Update inventory based on sync results
    const inventory = storage.getInventory();
    const errors: { productId: string; error: string }[] = [];
    let syncedCount = 0;
    const now = new Date().toISOString();

    syncResults.forEach(result => {
      if (result.success && result.quantity !== undefined) {
        // Find or create inventory item
        let inventoryItem = inventory.find(
          item => item.productId === result.productId && item.channelId === channelId
        );

        if (inventoryItem) {
          // Update existing inventory
          inventoryItem.quantity = result.quantity;
          inventoryItem.available = Math.max(0, result.quantity - inventoryItem.reserved);
          inventoryItem.lastSyncedAt = now;
          inventoryItem.updatedAt = now;
        } else {
          // Create new inventory item
          const newItem: InventoryItem = {
            id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            productId: result.productId,
            channelId: channelId,
            quantity: result.quantity,
            reserved: 0,
            available: result.quantity,
            lastSyncedAt: now,
            updatedAt: now
          };
          inventory.push(newItem);
        }

        syncedCount++;
      } else {
        errors.push({
          productId: result.productId,
          error: result.error || 'Unknown sync error'
        });
      }
    });

    // Save updated inventory
    storage.saveInventory(inventory);

    // Update channel sync status
    const lastSyncedAt = now;
    channel.lastSyncedAt = lastSyncedAt;
    
    if (errors.length === 0) {
      channel.syncStatus = 'success';
      channel.syncError = undefined;
    } else if (syncedCount > 0) {
      channel.syncStatus = 'success';
      channel.syncError = `Partial sync: ${errors.length} errors`;
    } else {
      channel.syncStatus = 'error';
      channel.syncError = `Sync failed: ${errors.length} errors`;
    }

    storage.saveChannels(channels);

    const response: SyncInventoryResponse = {
      success: errors.length < syncResults.length,
      syncedCount,
      errors,
      lastSyncedAt
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error syncing inventory:', error);

    // Update channel status to error
    try {
      const body = await request.json() as SyncInventoryRequest;
      const channels = storage.getChannels();
      const channel = channels.find(c => c.id === body.channelId);
      
      if (channel) {
        channel.syncStatus = 'error';
        channel.syncError = error instanceof Error ? error.message : 'Sync failed';
        storage.saveChannels(channels);
      }
    } catch (e) {
      // Ignore error updating channel status
    }

    const response: SyncInventoryResponse = {
      success: false,
      syncedCount: 0,
      errors: [{
        productId: '',
        error: error instanceof Error ? error.message : 'Failed to sync inventory'
      }],
      lastSyncedAt: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 500 });
  }
}