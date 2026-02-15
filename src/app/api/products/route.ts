import { NextRequest, NextResponse } from 'next/server';
import { 
  GetProductsResponse, 
  CreateProductRequest, 
  CreateProductResponse,
  Product,
  InventoryItem
} from '@/types';
import { StorageService } from '@/lib/storage';

export async function GET(request: NextRequest): Promise<NextResponse<GetProductsResponse>> {
  try {
    const storage = new StorageService();
    const products = storage.getProducts();

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let filteredProducts = products;

    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.sku.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      products: filteredProducts,
      total: filteredProducts.length
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      {
        success: false,
        products: [],
        total: 0
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<CreateProductResponse>> {
  try {
    const body: CreateProductRequest = await request.json();

    if (!body.sku || !body.name || !body.category) {
      return NextResponse.json(
        {
          success: false,
          product: {} as Product,
          inventory: []
        },
        { status: 400 }
      );
    }

    const storage = new StorageService();
    const products = storage.getProducts();
    const inventory = storage.getInventory();

    const existingSku = products.find(p => p.sku === body.sku);
    if (existingSku) {
      return NextResponse.json(
        {
          success: false,
          product: {} as Product,
          inventory: []
        },
        { status: 409 }
      );
    }

    const newProduct: Product = {
      id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sku: body.sku,
      name: body.name,
      description: body.description || '',
      category: body.category,
      price: body.price || 0,
      cost: body.cost || 0,
      reorderPoint: body.reorderPoint || 10,
      reorderQuantity: body.reorderQuantity || 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    products.push(newProduct);
    storage.saveProducts(products);

    const newInventoryItems: InventoryItem[] = [];

    if (body.initialStock && body.initialStock.length > 0) {
      const channels = storage.getChannels();
      
      for (const stock of body.initialStock) {
        const channel = channels.find(c => c.id === stock.channelId);
        if (channel) {
          const inventoryItem: InventoryItem = {
            id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            productId: newProduct.id,
            channelId: stock.channelId,
            quantity: stock.quantity,
            reserved: 0,
            available: stock.quantity,
            lastSyncedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          inventory.push(inventoryItem);
          newInventoryItems.push(inventoryItem);
        }
      }

      storage.saveInventory(inventory);
    }

    return NextResponse.json({
      success: true,
      product: newProduct,
      inventory: newInventoryItems
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      {
        success: false,
        product: {} as Product,
        inventory: []
      },
      { status: 500 }
    );
  }
}