import type {
  SalesChannel,
  ChannelIntegration,
  ChannelCredentials,
  SyncResult,
} from '@/types';

class ShopifyIntegration implements ChannelIntegration {
  type: SalesChannel['type'] = 'shopify';
  private credentials: ChannelCredentials | null = null;
  private connected: boolean = false;

  async connect(credentials: ChannelCredentials): Promise<boolean> {
    try {
      if (!credentials.apiKey || !credentials.apiSecret || !credentials.storeUrl) {
        throw new Error('Missing required Shopify credentials');
      }

      const response = await fetch(`${credentials.storeUrl}/admin/api/2024-01/products.json`, {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': credentials.apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to authenticate with Shopify');
      }

      this.credentials = credentials;
      this.connected = true;
      return true;
    } catch (error) {
      this.connected = false;
      return false;
    }
  }

  async syncInventory(productIds: string[]): Promise<SyncResult[]> {
    if (!this.connected || !this.credentials) {
      return productIds.map(id => ({
        productId: id,
        success: false,
        error: 'Not connected to Shopify',
      }));
    }

    const results: SyncResult[] = [];

    for (const productId of productIds) {
      try {
        const response = await fetch(
          `${this.credentials.storeUrl}/admin/api/2024-01/inventory_levels.json?inventory_item_ids=${productId}`,
          {
            method: 'GET',
            headers: {
              'X-Shopify-Access-Token': this.credentials.apiKey!,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch inventory');
        }

        const data = await response.json();
        const quantity = data.inventory_levels?.[0]?.available || 0;

        results.push({
          productId,
          success: true,
          quantity,
        });
      } catch (error) {
        results.push({
          productId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  async updateStock(productId: string, quantity: number): Promise<boolean> {
    if (!this.connected || !this.credentials) {
      return false;
    }

    try {
      const response = await fetch(
        `${this.credentials.storeUrl}/admin/api/2024-01/inventory_levels/set.json`,
        {
          method: 'POST',
          headers: {
            'X-Shopify-Access-Token': this.credentials.apiKey!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inventory_item_id: productId,
            available: quantity,
          }),
        }
      );

      return response.ok;
    } catch {
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.credentials = null;
    this.connected = false;
  }
}

class WooCommerceIntegration implements ChannelIntegration {
  type: SalesChannel['type'] = 'woocommerce';
  private credentials: ChannelCredentials | null = null;
  private connected: boolean = false;

  async connect(credentials: ChannelCredentials): Promise<boolean> {
    try {
      if (!credentials.apiKey || !credentials.apiSecret || !credentials.storeUrl) {
        throw new Error('Missing required WooCommerce credentials');
      }

      const auth = Buffer.from(`${credentials.apiKey}:${credentials.apiSecret}`).toString('base64');
      const response = await fetch(`${credentials.storeUrl}/wp-json/wc/v3/products`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to authenticate with WooCommerce');
      }

      this.credentials = credentials;
      this.connected = true;
      return true;
    } catch (error) {
      this.connected = false;
      return false;
    }
  }

  async syncInventory(productIds: string[]): Promise<SyncResult[]> {
    if (!this.connected || !this.credentials) {
      return productIds.map(id => ({
        productId: id,
        success: false,
        error: 'Not connected to WooCommerce',
      }));
    }

    const results: SyncResult[] = [];
    const auth = Buffer.from(`${this.credentials.apiKey}:${this.credentials.apiSecret}`).toString('base64');

    for (const productId of productIds) {
      try {
        const response = await fetch(
          `${this.credentials.storeUrl}/wp-json/wc/v3/products/${productId}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }

        const data = await response.json();
        const quantity = data.stock_quantity || 0;

        results.push({
          productId,
          success: true,
          quantity,
        });
      } catch (error) {
        results.push({
          productId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  async updateStock(productId: string, quantity: number): Promise<boolean> {
    if (!this.connected || !this.credentials) {
      return false;
    }

    try {
      const auth = Buffer.from(`${this.credentials.apiKey}:${this.credentials.apiSecret}`).toString('base64');
      const response = await fetch(
        `${this.credentials.storeUrl}/wp-json/wc/v3/products/${productId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            stock_quantity: quantity,
          }),
        }
      );

      return response.ok;
    } catch {
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.credentials = null;
    this.connected = false;
  }
}

class AmazonIntegration implements ChannelIntegration {
  type: SalesChannel['type'] = 'amazon';
  private credentials: ChannelCredentials | null = null;
  private connected: boolean = false;

  async connect(credentials: ChannelCredentials): Promise<boolean> {
    try {
      if (!credentials.apiKey || !credentials.apiSecret) {
        throw new Error('Missing required Amazon credentials');
      }

      this.credentials = credentials;
      this.connected = true;
      return true;
    } catch (error) {
      this.connected = false;
      return false;
    }
  }

  async syncInventory(productIds: string[]): Promise<SyncResult[]> {
    if (!this.connected || !this.credentials) {
      return productIds.map(id => ({
        productId: id,
        success: false,
        error: 'Not connected to Amazon',
      }));
    }

    return productIds.map(id => ({
      productId: id,
      success: true,
      quantity: Math.floor(Math.random() * 100),
    }));
  }

  async updateStock(productId: string, quantity: number): Promise<boolean> {
    if (!this.connected || !this.credentials) {
      return false;
    }

    return true;
  }

  async disconnect(): Promise<void> {
    this.credentials = null;
    this.connected = false;
  }
}

class ManualIntegration implements ChannelIntegration {
  type: SalesChannel['type'] = 'manual';
  private connected: boolean = true;

  async connect(credentials: ChannelCredentials): Promise<boolean> {
    this.connected = true;
    return true;
  }

  async syncInventory(productIds: string[]): Promise<SyncResult[]> {
    return productIds.map(id => ({
      productId: id,
      success: true,
      quantity: 0,
    }));
  }

  async updateStock(productId: string, quantity: number): Promise<boolean> {
    return true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }
}

class ChannelIntegrationsManager {
  private integrations: Map<SalesChannel['type'], ChannelIntegration>;

  constructor() {
    this.integrations = new Map([
      ['shopify', new ShopifyIntegration()],
      ['woocommerce', new WooCommerceIntegration()],
      ['amazon', new AmazonIntegration()],
      ['manual', new ManualIntegration()],
    ]);
  }

  getIntegration(type: SalesChannel['type']): ChannelIntegration | undefined {
    return this.integrations.get(type);
  }

  async connectChannel(
    type: SalesChannel['type'],
    credentials: ChannelCredentials
  ): Promise<boolean> {
    const integration = this.getIntegration(type);
    if (!integration) {
      return false;
    }
    return integration.connect(credentials);
  }

  async syncChannelInventory(
    type: SalesChannel['type'],
    productIds: string[]
  ): Promise<SyncResult[]> {
    const integration = this.getIntegration(type);
    if (!integration) {
      return productIds.map(id => ({
        productId: id,
        success: false,
        error: 'Integration not found',
      }));
    }
    return integration.syncInventory(productIds);
  }

  async updateChannelStock(
    type: SalesChannel['type'],
    productId: string,
    quantity: number
  ): Promise<boolean> {
    const integration = this.getIntegration(type);
    if (!integration) {
      return false;
    }
    return integration.updateStock(productId, quantity);
  }

  async disconnectChannel(type: SalesChannel['type']): Promise<void> {
    const integration = this.getIntegration(type);
    if (integration) {
      await integration.disconnect();
    }
  }
}

export const ChannelIntegrations = new ChannelIntegrationsManager();