-- Sample data for Smart Inventory Manager development and testing

-- Insert sample users
INSERT INTO users (id, email, name, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@inventory.com', 'Admin User', 'admin'),
  ('550e8400-e29b-41d4-a716-446655440002', 'manager@inventory.com', 'Store Manager', 'manager'),
  ('550e8400-e29b-41d4-a716-446655440003', 'staff@inventory.com', 'Staff Member', 'staff');

-- Insert sample sales channels
INSERT INTO sales_channels (id, name, type, is_active, last_synced_at, sync_status) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'Main Warehouse', 'manual', true, CURRENT_TIMESTAMP, 'success'),
  ('650e8400-e29b-41d4-a716-446655440002', 'Shopify Store', 'shopify', true, CURRENT_TIMESTAMP - INTERVAL '2 hours', 'success'),
  ('650e8400-e29b-41d4-a716-446655440003', 'Amazon Marketplace', 'amazon', true, CURRENT_TIMESTAMP - INTERVAL '5 hours', 'success'),
  ('650e8400-e29b-41d4-a716-446655440004', 'eBay Store', 'ebay', true, CURRENT_TIMESTAMP - INTERVAL '1 day', 'idle'),
  ('650e8400-e29b-41d4-a716-446655440005', 'WooCommerce Site', 'woocommerce', false, NULL, 'error');

-- Insert sample products
INSERT INTO products (id, sku, name, description, category, price, cost, reorder_point, reorder_quantity) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', 'LAPTOP-001', 'Professional Laptop 15"', 'High-performance laptop with 16GB RAM and 512GB SSD', 'Electronics', 1299.99, 899.99, 5, 10),
  ('750e8400-e29b-41d4-a716-446655440002', 'MOUSE-001', 'Wireless Gaming Mouse', 'Ergonomic wireless mouse with RGB lighting', 'Electronics', 79.99, 45.00, 20, 50),
  ('750e8400-e29b-41d4-a716-446655440003', 'KEYBOARD-001', 'Mechanical Keyboard', 'RGB mechanical keyboard with blue switches', 'Electronics', 149.99, 89.99, 15, 30),
  ('750e8400-e29b-41d4-a716-446655440004', 'MONITOR-001', '27" 4K Monitor', 'Ultra HD 4K monitor with HDR support', 'Electronics', 499.99, 329.99, 8, 15),
  ('750e8400-e29b-41d4-a716-446655440005', 'HEADSET-001', 'Noise Cancelling Headset', 'Premium wireless headset with active noise cancellation', 'Electronics', 299.99, 179.99, 12, 25),
  ('750e8400-e29b-41d4-a716-446655440006', 'WEBCAM-001', 'HD Webcam 1080p', 'Full HD webcam with auto-focus and built-in microphone', 'Electronics', 89.99, 49.99, 25, 50),
  ('750e8400-e29b-41d4-a716-446655440007', 'DESK-001', 'Standing Desk', 'Electric height-adjustable standing desk', 'Furniture', 599.99, 399.99, 3, 5),
  ('750e8400-e29b-41d4-a716-446655440008', 'CHAIR-001', 'Ergonomic Office Chair', 'Premium ergonomic chair with lumbar support', 'Furniture', 449.99, 279.99, 5, 10),
  ('750e8400-e29b-41d4-a716-446655440009', 'CABLE-001', 'USB-C Cable 2m', 'High-speed USB-C charging and data cable', 'Accessories', 19.99, 8.99, 100, 200),
  ('750e8400-e29b-41d4-a716-446655440010', 'ADAPTER-001', 'USB-C Hub Adapter', 'Multi-port USB-C hub with HDMI and USB 3.0', 'Accessories', 49.99, 24.99, 30, 60),
  ('750e8400-e29b-41d4-a716-446655440011', 'BACKPACK-001', 'Laptop Backpack', 'Water-resistant laptop backpack with multiple compartments', 'Accessories', 79.99, 39.99, 15, 30),
  ('750e8400-e29b-41d4-a716-446655440012', 'TABLET-001', '10" Tablet', 'Android tablet with 64GB storage', 'Electronics', 349.99, 229.99, 10, 20),
  ('750e8400-e29b-41d4-a716-446655440013', 'SPEAKER-001', 'Bluetooth Speaker', 'Portable waterproof Bluetooth speaker', 'Electronics', 129.99, 69.99, 20, 40),
  ('750e8400-e29b-41d4-a716-446655440014', 'CHARGER-001', 'Fast Charger 65W', 'USB-C fast charger with GaN technology', 'Accessories', 39.99, 19.99, 50, 100),
  ('750e8400-e29b-41d4-a716-446655440015', 'MOUSEPAD-001', 'Extended Mouse Pad', 'Large gaming mouse pad with non-slip base', 'Accessories', 24.99, 12.99, 40, 80);

-- Insert inventory for Main Warehouse
INSERT INTO inventory (product_id, channel_id, quantity, reserved, last_synced_at) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 12, 2, CURRENT_TIMESTAMP),
  ('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 45, 5, CURRENT_TIMESTAMP),
  ('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', 28, 3, CURRENT_TIMESTAMP),
  ('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440001', 15, 2, CURRENT_TIMESTAMP),
  ('750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440001', 22, 4, CURRENT_TIMESTAMP),
  ('750e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440001', 38, 6, CURRENT_TIMESTAMP),
  ('750e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440001', 4, 1, CURRENT_TIMESTAMP),
  ('750e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440001', 8, 1, CURRENT_TIMESTAMP),
  ('750e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440001', 156, 12, CURRENT_TIMESTAMP),
  ('750e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440001', 42, 5, CURRENT_TIMESTAMP),
  ('750e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440001', 19, 2, CURRENT_TIMESTAMP),
  ('750e8400-e29b-41d4-a716-446655440012', '650e8400-e29b-41d4-a716-446655440001', 14, 2, CURRENT_TIMESTAMP),
  ('750e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440001', 31, 4, CURRENT_TIMESTAMP),
  ('750e8400-e29b-41d4-a716-446655440014', '650e8400-e29b-41d4-a716-446655440001', 67, 8, CURRENT_TIMESTAMP),
  ('750e8400-e29b-41d4-a716-446655440015', '650e8400-e29b-41d4-a716-446655440001', 52, 6, CURRENT_TIMESTAMP);

-- Insert inventory for Shopify Store
INSERT INTO inventory (product_id, channel_id, quantity, reserved, last_synced_at) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 8, 1, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
  ('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', 32, 3, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
  ('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440002', 21, 2, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
  ('750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440002', 16, 2, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
  ('750e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440002', 28, 4, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
  ('750e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440002', 89, 8, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
  ('750e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440002', 34, 3, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
  ('750e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440002', 24, 3, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
  ('750e8400-e29b-41d4-a716-446655440014', '650e8400-e29b-41d4-a716-446655440002', 45, 5, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
  ('750e8400-e29b-41d4-a716-446655440015', '650e8400-e29b-41d4-a716-446655440002', 38, 4, CURRENT_TIMESTAMP - INTERVAL '2 hours');

-- Insert inventory for Amazon Marketplace
INSERT INTO inventory (product_id, channel_id, quantity, reserved, last_synced_at) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', 6, 1, CURRENT_TIMESTAMP - INTERVAL '5 hours'),
  ('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440003', 28, 2, CURRENT_TIMESTAMP - INTERVAL '5 hours'),
  ('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440003', 11, 1, CURRENT_TIMESTAMP - INTERVAL '5 hours'),
  ('750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440003', 18, 2, CURRENT_TIMESTAMP - INTERVAL '5 hours'),
  ('750e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440003', 22, 3, CURRENT_TIMESTAMP - INTERVAL '5 hours'),
  ('750e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440003', 112, 10, CURRENT_TIMESTAMP - INTERVAL '5 hours'),
  ('750e8400-e29b-41d4-a716-446655440012', '650e8400-e29b-41d4-a716-446655440003', 9, 1, CURRENT_TIMESTAMP - INTERVAL '5 hours'),
  ('750e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440003', 19, 2, CURRENT_TIMESTAMP - INTERVAL '5 hours'),
  ('750e8400-e29b-41d4-a716-446655440014', '650e8400-e29b-41d4-a716-446655440003', 56, 6, CURRENT_TIMESTAMP - INTERVAL '5 hours');

-- Insert inventory for eBay Store
INSERT INTO inventory (product_id, channel_id, quantity, reserved, last_synced_at) VALUES
  ('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440004', 18, 1, CURRENT_TIMESTAMP - INTERVAL '1 day'),
  ('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440004', 12, 1, CURRENT_TIMESTAMP - INTERVAL '1 day'),
  ('750e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440004', 67, 5, CURRENT_TIMESTAMP - INTERVAL '1 day'),
  ('750e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440004', 23, 2, CURRENT_TIMESTAMP - INTERVAL '1 day'),
  ('750e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440004', 14, 1, CURRENT_TIMESTAMP - INTERVAL '1 day'),
  ('750e8400-e29b-41d4-a716-446655440015', '650e8400-e29b-41d4-a716-446655440004', 29, 3, CURRENT_TIMESTAMP - INTERVAL '1 day');

-- Insert sample stock movements (recent activity)
INSERT INTO stock_movements (product_id, channel_id, type, quantity, previous_quantity, new_quantity, reason, reference, created_at, created_by) VALUES
  -- Recent purchases
  ('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'purchase', 5, 7, 12, 'Restocking from supplier', 'PO-2024-001', CURRENT_TIMESTAMP - INTERVAL '3 hours', '550e8400-e29b-41d4-a716-446655440002'),
  ('750e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440001', 'purchase', 100, 56, 156, 'Bulk order for high-demand item', 'PO-2024-002', CURRENT_TIMESTAMP - INTERVAL '5 hours', '550e8400-e29b-41d4-a716-446655440002'),
  ('750e8400-e29b-41d4-a716-446655440014', '650e8400-e29b-41d4-a716-446655440001', 'purchase', 50, 17, 67, 'Restocking from supplier', 'PO-2024-003', CURRENT_TIMESTAMP - INTERVAL '8 hours', '550e8400-e29b-41d4-a716-446655440002'),
  
  -- Recent sales
  ('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', 'sale', -3, 35, 32, 'Online order', 'ORD-SH-5421', CURRENT_TIMESTAMP - INTERVAL '1 hour', '550e8400-e29b-41d4-a716-446655440003'),
  ('750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440002', 'sale', -2, 18, 16, 'Online order', 'ORD-SH-5422', CURRENT_TIMESTAMP - INTERVAL '2 hours', '550e8400-e29b-41d4-a716-446655440003'),
  ('750e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440003', 'sale', -8, 120, 112, 'Amazon bulk order', 'ORD-AMZ-8932', CURRENT_TIMESTAMP - INTERVAL '4 hours', '550e8400-e29b-41d4-a716-446655440003'),
  ('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', 'sale', -1, 7, 6, 'Amazon order', 'ORD-AMZ-8933', CURRENT_TIMESTAMP - INTERVAL '6 hours', '550e8400-e29b-41d4-a716-446655440003'),
  ('750e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440002', 'sale', -4, 28, 24, 'Online order', 'ORD-SH-5423', CURRENT_TIMESTAMP - INTERVAL '7 hours', '550e8400-e29b-41d4-a716-446655440003'),
  
  -- Adjustments
  ('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', 'adjustment', -2, 30, 28, 'Damaged items removed', 'ADJ-2024-001', CURRENT_TIMESTAMP - INTERVAL '12 hours', '550e8400-e29b-41d4-a716-446655440002'),
  ('750e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440001', 'adjustment', 3, 39, 42, 'Found during inventory count', 'ADJ-2024-002', CURRENT_TIMESTAMP - INTERVAL '15 hours', '550e8400-e29b-41d4-a716-446655440002'),
  
  -- Returns
  ('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', 'return', 2, 30, 32, 'Customer return - unopened', 'RET-SH-1234', CURRENT_TIMESTAMP - INTERVAL '18 hours', '550e8400-e29b-41d4-a716-446655440003'),
  ('750e8400-e29b-41d4-a716-446655440012', '650e8400-e29b-41d4-a716-446655440003', 'return', 1, 8, 9, 'Customer return - defective', 'RET-AMZ-5678', CURRENT_TIMESTAMP - INTERVAL '20 hours', '550e8400-e29b-41d4-a716-446655440003'),
  
  -- Transfers
  ('750e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440001', 'transfer', -5, 43, 38, 'Transfer to Shopify fulfillment', 'TRF-2024-001', CURRENT_TIMESTAMP - INTERVAL '1 day', '550e8400-e29b-41d4-a716-446655440002'),
  ('750e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440002', 'transfer', 5, 23, 28, 'Transfer from warehouse', 'TRF-2024-001', CURRENT_TIMESTAMP - INTERVAL '1 day', '550e8400-e29b-41d4-a716-446655440002'),
  
  -- Older movements for history
  ('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'purchase', 10, 0, 10, 'Initial stock', 'PO-2024-INIT-001', CURRENT_TIMESTAMP - INTERVAL '30 days', '550e8400-e29b-41d4-a716-446655440001'),
  ('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 'purchase', 50, 0, 50, 'Initial stock', 'PO-2024-INIT-002', CURRENT_TIMESTAMP - INTERVAL '30 days', '550e8400-e29b-41d4-a716-446655440001'),
  ('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', 'purchase', 30, 0, 30, 'Initial stock', 'PO-2024-INIT-003', CURRENT_TIMESTAMP - INTERVAL '30 days', '550e8400-e29b-41d4-a716-446655440001'),
  ('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440001', 'purchase', 15, 0, 15, 'Initial stock', 'PO-2024-INIT-004', CURRENT_TIMESTAMP - INTERVAL '30 days', '550e8400-e29b-41d4-a716-446655440001'),
  ('750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440001', 'purchase', 25, 0, 25, 'Initial stock', 'PO-2024-INIT-005', CURRENT_TIMESTAMP - INTERVAL '30 days', '550e8400-e29b-41d4-a716-446655440001'),
  ('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'sale', -3, 10, 7, 'Warehouse sale', 'ORD-WH-001', CURRENT_TIMESTAMP - INTERVAL '25 days', '550e8400-e29b-41d4-a716-446655440003'),
  ('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 'sale', -5, 50, 45, 'Warehouse sale', 'ORD-WH-002', CURRENT_TIMESTAMP - INTERVAL '20 days', '550e8400-e29b-41d4-a716-446655440003'),
  ('750e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440001', 'purchase', 5, 0, 5, 'Initial stock', 'PO-2024-INIT-007', CURRENT_TIMESTAMP - INTERVAL '28 days', '550e8400-e29b-41d4-a716-446655440001'),
  ('750e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440001', 'sale', -1, 5, 4, 'Warehouse sale', 'ORD-WH-003', CURRENT_TIMESTAMP - INTERVAL '15 days', '550e8400-e29b-41d4-a716-446655440003'),
  ('750e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440001', 'purchase', 10, 0, 10, 'Initial stock', 'PO-2024-INIT-008', CURRENT_TIMESTAMP - INTERVAL '28 days', '550e8400-e29b-41d4-a716-446655440001'),
  ('750e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440001', 'sale', -2, 10, 8, 'Warehouse sale', 'ORD-WH-004', CURRENT_TIMESTAMP - INTERVAL '10 days', '550e8400-e29b-41d4-a716-446655440003');

-- Verify data integrity
DO $$
DECLARE
  product_count INTEGER;
  inventory_count INTEGER;
  channel_count INTEGER;
  movement_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO product_count FROM products;
  SELECT COUNT(*) INTO inventory_count FROM inventory;
  SELECT COUNT(*) INTO channel_count FROM sales_channels;
  SELECT COUNT(*) INTO movement_count FROM stock_movements;
  
  RAISE NOTICE 'Seed data inserted successfully:';
  RAISE NOTICE '  Products: %', product_count;
  RAISE NOTICE '  Inventory records: %', inventory_count;
  RAISE NOTICE '  Sales channels: %', channel_count;
  RAISE NOTICE '  Stock movements: %', movement_count;
END $$;