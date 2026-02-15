import { NextRequest, NextResponse } from 'next/server';
import { StorageService } from '@/lib/storage';
import type { GetInventoryResponse, InventoryItem, Product, SalesChannel } from '@/types';

const storage = new StorageService();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('productId');
    const channelId = searchParams.get('channelId');

    let inventory = storage.getInventory();
    const products = storage.getProducts();
    const channels = storage.getChannels();

    // Filter by productId if provided
    if (productId) {
      inventory = inventory.filter(item => item.productId === productId);
    }

    // Filter by channelId if provided
    if (channelId) {
      inventory = inventory.filter(item => item.channelId === channelId);
    }

    // Create product and channel maps for efficient lookup
    const productMap = new Map<string, Product>();
    products.forEach(p => productMap.set(p.id, p));

    const channelMap = new Map<string, SalesChannel>();
    channels.forEach(c => channelMap.set(c.id, c));

    // Enrich inventory items with product and channel data
    const enrichedInventory = inventory
      .map(item => {
        const product = productMap.get(item.productId);
        const channel = channelMap.get(item.channelId);

        if (!product || !channel) {
          return null;
        }

        return {
          ...item,
          product,
          channel
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    const response: GetInventoryResponse = {
      success: true,
      inventory: enrichedInventory
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    
    return NextResponse.json(
      {
        success: false,
        inventory: [],
        error: error instanceof Error ? error.message : 'Failed to fetch inventory'
      },
      { status: 500 }
    );
  }
}