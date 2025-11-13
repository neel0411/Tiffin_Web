// migrations/addSupplierToOrderItems.js
import mongoose from 'mongoose';
import OrderItem from '../models/orderItem.js';
import Menu from '../models/menu.js';
import Order from '../models/order.js';

export const migrateOrderItems = async () => {
  try {
    console.log("🔄 Starting order items migration...");
    
    // Find order items without supplier_id
    const orderItems = await OrderItem.find({ supplier_id: { $exists: false } });
    
    console.log(`📦 Found ${orderItems.length} order items to migrate`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const item of orderItems) {
      try {
        const menu = await Menu.findById(item.menu_id);
        if (menu && menu.supplier_id) {
          item.supplier_id = menu.supplier_id;
          await item.save();
          updatedCount++;
          console.log(`✅ Updated order item ${item._id} with supplier ${menu.supplier_id}`);
        } else {
          console.log(`⚠️ Menu not found for order item ${item._id}`);
          errorCount++;
        }
      } catch (error) {
        console.error(`❌ Error updating order item ${item._id}:`, error);
        errorCount++;
      }
    }
    
    console.log(`🎉 Migration completed! Updated: ${updatedCount}, Errors: ${errorCount}`);
    
  } catch (error) {
    console.error('❌ Migration error:', error);
  }
};

// Run migration when needed
// migrateOrderItems();