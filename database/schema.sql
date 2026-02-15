-- PostgreSQL Database Schema for Smart Inventory Manager

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'staff')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  reorder_point INTEGER NOT NULL DEFAULT 10,
  reorder_quantity INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sales channels table
CREATE TABLE sales_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('shopify', 'woocommerce', 'amazon', 'ebay', 'manual')),
  api_key TEXT,
  api_secret TEXT,
  store_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  sync_status VARCHAR(50) DEFAULT 'idle' CHECK (sync_status IN ('idle', 'syncing', 'error', 'success')),
  sync_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inventory table
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES sales_channels(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved INTEGER NOT NULL DEFAULT 0,
  available INTEGER GENERATED ALWAYS AS (quantity - reserved) STORED,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, channel_id)
);

-- Stock movements table
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES sales_channels(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('purchase', 'sale', 'adjustment', 'transfer', 'return')),
  quantity INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reason TEXT,
  reference VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_inventory_product_id ON inventory(product_id);
CREATE INDEX idx_inventory_channel_id ON inventory(channel_id);
CREATE INDEX idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_channel_id ON stock_movements(channel_id);
CREATE INDEX idx_stock_movements_created_at ON stock_movements(created_at DESC);

-- Trigger to update products.updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- View for low stock products
CREATE VIEW low_stock_products AS
SELECT 
  p.id,
  p.sku,
  p.name,
  p.reorder_point,
  SUM(i.available) as total_available
FROM products p
LEFT JOIN inventory i ON p.id = i.product_id
GROUP BY p.id, p.sku, p.name, p.reorder_point
HAVING SUM(i.available) <= p.reorder_point;