import { NextRequest, NextResponse } from 'next/server';
import {
  GetChannelsResponse,
  CreateChannelRequest,
  CreateChannelResponse,
  SalesChannel,
} from '@/types';

// In-memory storage for prototype
let channels: SalesChannel[] = [
  {
    id: 'channel_1',
    name: 'Main Store',
    type: 'manual',
    isActive: true,
    lastSyncedAt: new Date().toISOString(),
    syncStatus: 'success',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'channel_2',
    name: 'Shopify Store',
    type: 'shopify',
    storeUrl: 'https://mystore.myshopify.com',
    isActive: true,
    lastSyncedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    syncStatus: 'success',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'channel_3',
    name: 'Amazon Seller',
    type: 'amazon',
    isActive: true,
    lastSyncedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    syncStatus: 'idle',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Initialize with global cache if available
function initializeData() {
  if (typeof window === 'undefined') {
    if ((global as any).__inventoryData?.channels) {
      channels = (global as any).__inventoryData.channels;
    } else {
      // Initialize global cache with default data
      if (!(global as any).__inventoryData) {
        (global as any).__inventoryData = {};
      }
      (global as any).__inventoryData.channels = channels;
    }
  }
}

function saveData() {
  if (typeof window === 'undefined') {
    if (!(global as any).__inventoryData) {
      (global as any).__inventoryData = {};
    }
    (global as any).__inventoryData.channels = channels;
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<GetChannelsResponse>> {
  try {
    initializeData();

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const type = searchParams.get('type');

    let filteredChannels = [...channels];

    // Apply filters
    if (isActive !== null) {
      const activeFilter = isActive === 'true';
      filteredChannels = filteredChannels.filter(c => c.isActive === activeFilter);
    }

    if (type) {
      filteredChannels = filteredChannels.filter(c => c.type === type);
    }

    // Sort by creation date descending
    filteredChannels.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      channels: filteredChannels,
    });
  } catch (error) {
    console.error('Error fetching channels:', error);
    return NextResponse.json(
      {
        success: false,
        channels: [],
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<CreateChannelResponse>> {
  try {
    initializeData();

    const body: CreateChannelRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.type) {
      return NextResponse.json(
        {
          success: false,
          channel: {} as SalesChannel,
        },
        { status: 400 }
      );
    }

    // Validate channel type
    const validTypes = ['shopify', 'woocommerce', 'amazon', 'ebay', 'manual'];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        {
          success: false,
          channel: {} as SalesChannel,
        },
        { status: 400 }
      );
    }

    // Check for duplicate channel name
    const existingChannel = channels.find(
      c => c.name.toLowerCase() === body.name.toLowerCase()
    );
    if (existingChannel) {
      return NextResponse.json(
        {
          success: false,
          channel: {} as SalesChannel,
        },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();

    // Create new channel
    const newChannel: SalesChannel = {
      id: `channel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: body.name,
      type: body.type,
      apiKey: body.apiKey,
      apiSecret: body.apiSecret,
      storeUrl: body.storeUrl,
      isActive: true,
      lastSyncedAt: null,
      syncStatus: 'idle',
      createdAt: now,
    };

    channels.push(newChannel);
    saveData();

    return NextResponse.json({
      success: true,
      channel: newChannel,
    });
  } catch (error) {
    console.error('Error creating channel:', error);
    return NextResponse.json(
      {
        success: false,
        channel: {} as SalesChannel,
      },
      { status: 500 }
    );
  }
}