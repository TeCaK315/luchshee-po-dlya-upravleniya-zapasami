import { NextRequest, NextResponse } from 'next/server';
import {
  GetStockMovementsResponse,
  CreateStockMovementRequest,
  CreateStockMovementResponse,
  StockMovement,
  InventoryItem,
  Product,
  SalesChannel,
} from '@/types';

// In-memory storage for prototype
let movements: StockMovement[] = [];
let inventory: InventoryItem[] = [];
let products: Product[] = [];
let channels: SalesChannel[] = [];

// Initialize with localStorage data if available
function initializeData() {
  if (typeof window === 'undefined') {
    // Server-side: try to get from global cache
    if ((global as any).__inventoryData) {
      movements = (global as any).__inventoryData.movements || [];
      inventory = (global as any).__inventoryData.inventory || [];
      products = (global as any).__inventoryData.products || [];
      channels = (global as any).__inventoryData.channels || [];
    }
  }
}

function saveData() {
  if (typeof window === 'undefined') {
    // Server-side: save to global cache
    (global as any).__inventoryData = {
      movements,
      inventory,
      products,
      channels,
    };
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<GetStockMovementsResponse>> {
  try {
    initializeData();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const channelId = searchParams.get('channelId');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');

    let filteredMovements = [...movements];

    // Apply filters
    if (productId) {
      filteredMovements = filteredMovements.filter(m => m.productId === productId);
    }

    if (channelId) {
      filteredMovements = filteredMovements.filter(m => m.channelId === channelId);
    }

    if (type) {
      filteredMovements = filteredMovements.filter(m => m.type === type);
    }

    if (startDate) {
      filteredMovements = filteredMovements.filter(
        m => new Date(m.createdAt) >= new Date(startDate)
      );
    }

    if (endDate) {
      filteredMovements = filteredMovements.filter(
        m => new Date(m.createdAt) <= new Date(endDate)
      );
    }

    // Sort by date descending
    filteredMovements.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Apply limit
    filteredMovements = filteredMovements.slice(0, limit);

    // Enrich with product and channel data
    const enrichedMovements = filteredMovements.map(movement => {
      const product = products.find(p => p.id === movement.productId);
      const channel = channels.find(c => c.id === movement.channelId);

      return {
        ...movement,
        product: product || {
          id: movement.productId,
          sku: 'UNKNOWN',
          name: 'Unknown Product',
          description: '',
          category: '',
          price: 0,
          cost: 0,
          reorderPoint: 0,
          reorderQuantity: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        channel: channel || {
          id: movement.channelId,
          name: 'Unknown Channel',
          type: 'manual' as const,
          isActive: false,
          lastSyncedAt: null,
          syncStatus: 'idle' as const,
          createdAt: new Date().toISOString(),
        },
      };
    });

    return NextResponse.json({
      success: true,
      movements: enrichedMovements,
      total: filteredMovements.length,
    });
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    return NextResponse.json(
      {
        success: false,
        movements: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<CreateStockMovementResponse>> {
  try {
    initializeData();

    const body: CreateStockMovementRequest = await request.json();

    // Validate required fields
    if (!body.productId || !body.channelId || !body.type || body.quantity === undefined) {
      return NextResponse.json(
        {
          success: false,
          movement: {} as StockMovement,
          updatedInventory: {} as InventoryItem,
        },
        { status: 400 }
      );
    }

    // Find the inventory item
    const inventoryIndex = inventory.findIndex(
      item => item.productId === body.productId && item.channelId === body.channelId
    );

    let inventoryItem: InventoryItem;
    const now = new Date().toISOString();

    if (inventoryIndex === -1) {
      // Create new inventory item if it doesn't exist
      inventoryItem = {
        id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        productId: body.productId,
        channelId: body.channelId,
        quantity: 0,
        reserved: 0,
        available: 0,
        lastSyncedAt: now,
        updatedAt: now,
      };
      inventory.push(inventoryItem);
    } else {
      inventoryItem = inventory[inventoryIndex];
    }

    const previousQuantity = inventoryItem.quantity;

    // Calculate new quantity based on movement type
    let quantityChange = body.quantity;
    if (body.type === 'sale' || body.type === 'adjustment') {
      quantityChange = -Math.abs(body.quantity);
    } else if (body.type === 'purchase' || body.type === 'return') {
      quantityChange = Math.abs(body.quantity);
    }

    const newQuantity = Math.max(0, previousQuantity + quantityChange);

    // Create stock movement record
    const movement: StockMovement = {
      id: `mov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId: body.productId,
      channelId: body.channelId,
      type: body.type,
      quantity: Math.abs(body.quantity),
      previousQuantity,
      newQuantity,
      reason: body.reason,
      reference: body.reference,
      createdAt: now,
      createdBy: 'system',
    };

    movements.push(movement);

    // Update inventory
    inventoryItem.quantity = newQuantity;
    inventoryItem.available = Math.max(0, newQuantity - inventoryItem.reserved);
    inventoryItem.updatedAt = now;

    if (inventoryIndex === -1) {
      inventory.push(inventoryItem);
    } else {
      inventory[inventoryIndex] = inventoryItem;
    }

    saveData();

    return NextResponse.json({
      success: true,
      movement,
      updatedInventory: inventoryItem,
    });
  } catch (error) {
    console.error('Error creating stock movement:', error);
    return NextResponse.json(
      {
        success: false,
        movement: {} as StockMovement,
        updatedInventory: {} as InventoryItem,
      },
      { status: 500 }
    );
  }
}