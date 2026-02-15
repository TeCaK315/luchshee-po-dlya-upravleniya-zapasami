import { NextRequest, NextResponse } from 'next/server';
import { 
  UpdateProductRequest, 
  UpdateProductResponse,
  DeleteProductResponse,
  Product
} from '@/types';
import { StorageService } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<{ success: boolean; product?: Product }>> {
  try {
    const storage = new StorageService();
    const products = storage.getProducts();
    
    const product = products.find(p => p.id === params.id);

    if (!product) {
      return NextResponse.json(
        {
          success: false
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      {
        success: false
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<UpdateProductResponse>> {
  try {
    const body: UpdateProductRequest = await request.json();
    const storage = new StorageService();
    const products = storage.getProducts();
    
    const productIndex = products.findIndex(p => p.id === params.id);

    if (productIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          product: {} as Product
        },
        { status: 404 }
      );
    }

    if (body.sku) {
      const existingSku = products.find(p => p.sku === body.sku && p.id !== params.id);
      if (existingSku) {
        return NextResponse.json(
          {
            success: false,
            product: {} as Product
          },
          { status: 409 }
        );
      }
    }

    const updatedProduct: Product = {
      ...products[productIndex],
      ...(body.sku !== undefined && { sku: body.sku }),
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.price !== undefined && { price: body.price }),
      ...(body.cost !== undefined && { cost: body.cost }),
      ...(body.reorderPoint !== undefined && { reorderPoint: body.reorderPoint }),
      ...(body.reorderQuantity !== undefined && { reorderQuantity: body.reorderQuantity }),
      updatedAt: new Date().toISOString()
    };

    products[productIndex] = updatedProduct;
    storage.saveProducts(products);

    return NextResponse.json({
      success: true,
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      {
        success: false,
        product: {} as Product
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<DeleteProductResponse>> {
  try {
    const storage = new StorageService();
    const products = storage.getProducts();
    const inventory = storage.getInventory();
    const movements = storage.getMovements();
    
    const productIndex = products.findIndex(p => p.id === params.id);

    if (productIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: 'Product not found'
        },
        { status: 404 }
      );
    }

    products.splice(productIndex, 1);
    storage.saveProducts(products);

    const updatedInventory = inventory.filter(i => i.productId !== params.id);
    storage.saveInventory(updatedInventory);

    const updatedMovements = movements.filter(m => m.productId !== params.id);
    storage.saveMovements(updatedMovements);

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete product'
      },
      { status: 500 }
    );
  }
}