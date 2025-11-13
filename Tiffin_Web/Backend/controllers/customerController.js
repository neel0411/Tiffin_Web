import Customer from '../models/customer.js';
import bcrypt from 'bcrypt';

// Get all customers (Admin only)
// Get all customers (Admin only)
export const getCustomers = async (req, res) => {
  try {
    console.log("📊 Fetching all customers for admin...");
    
    const customers = await Customer.find().select('-password');
    console.log(`✅ Found ${customers.length} customers`);
    
    res.json(customers);
  } catch (err) {
    console.error("❌ Error fetching customers:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get customer profile
export const getProfile = async (req, res) => {
  try {
    const customerId = req.params.id || req.user.id;
    
    // Check if user is accessing their own profile or is admin
    if (req.params.id && req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const customer = await Customer.findById(customerId).select('-password');
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Only the logged-in user can update their profile
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Don't allow password update via this route
    const { password, ...updateData } = req.body;
    
    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(updatedCustomer);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (req.user.id !== id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const customer = await Customer.findById(id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const isMatch = await bcrypt.compare(currentPassword, customer.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    customer.password = await bcrypt.hash(newPassword, salt);
    await customer.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Block customer
// In your customerController.js - ADD THIS FUNCTION
export const blockCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔄 Blocking customer with ID: ${id}`);

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Toggle status between active and blocked
    const newStatus = customer.status === 'active' ? 'blocked' : 'active';
    
    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      { status: newStatus },
      { new: true }
    ).select('-password');

    console.log(`✅ Customer ${newStatus === 'blocked' ? 'blocked' : 'unblocked'} successfully`);

    res.json({
      message: `Customer ${newStatus === 'blocked' ? 'blocked' : 'unblocked'} successfully`,
      customer: updatedCustomer
    });
  } catch (err) {
    console.error('❌ Block customer error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};