// controllers/menuController.js
import Menu from "../models/menu.js";

// ✅ Get all menus
export const getMenus = async (req, res) => {
  try {
    const filter = {};

    // ✅ Filter by category
    if (req.query.cat_id) filter.cat_id = req.query.cat_id;

    // ✅ Filter by supplier
    if (req.query.supplier_id) filter.supplier_id = req.query.supplier_id;

    const menus = await Menu.find(filter).populate("cat_id supplier_id");
    res.json(menus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get menu by ID
export const getMenuById = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id).populate("cat_id supplier_id");
    if (!menu) return res.status(404).json({ message: "Menu not found" });
    res.json(menu);
  } catch (err) {
    res.status(500).json({ message: "Error fetching menu by ID", error: err.message });
  }
};

// ✅ Add new menu - DEBUG VERSION
export const addMenu = async (req, res) => {
  try {
    console.log("=== ADD MENU DEBUG ===");
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);

    const { menu_name, menu_price, cat_id, supplier_id, menu_desc, menu_type } = req.body;
    
    // Validate required fields
    const errors = {};
    if (!menu_name) errors.menu_name = "Path `menu_name` is required.";
    if (!menu_price) errors.menu_price = "Path `menu_price` is required.";
    if (!cat_id) errors.cat_id = "Path `cat_id` is required.";
    if (!supplier_id) errors.supplier_id = "Path `supplier_id` is required.";

    if (Object.keys(errors).length > 0) {
      console.log("Validation errors:", errors);
      return res.status(400).json({ 
        message: "Validation failed",
        errors: errors
      });
    }

    const menuData = {
      menu_name,
      menu_price: parseFloat(menu_price),
      cat_id,
      supplier_id,
      menu_desc: menu_desc || "",
      menu_type: menu_type || "Veg",
      menu_image: req.file ? `/uploads/menu/${req.file.filename}` : ""
    };

    console.log("Final menu data:", menuData);

    const menu = new Menu(menuData);
    await menu.save();
    
    // Populate the saved menu before sending response
    const populatedMenu = await Menu.findById(menu._id).populate("cat_id supplier_id");
    
    console.log("Menu saved successfully:", populatedMenu);
    res.status(201).json(populatedMenu);
  } catch (err) {
    console.error("❌ ERROR adding menu:", err);
    
    if (err.name === 'ValidationError') {
      const errors = {};
      Object.keys(err.errors).forEach(key => {
        errors[key] = err.errors[key].message;
      });
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: errors 
      });
    }
    
    res.status(500).json({ 
      message: "Error adding menu", 
      error: err.message
    });
  }
};

// ✅ Update menu
export const updateMenu = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    if (req.file) {
      updateData.menu_image = `/uploads/menu/${req.file.filename}`;
    }
    
    // Convert price to number if it exists
    if (updateData.menu_price) {
      updateData.menu_price = parseFloat(updateData.menu_price);
    }
    
    const menu = await Menu.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    ).populate("cat_id supplier_id");
    
    if (!menu) return res.status(404).json({ message: "Menu not found" });
    res.json(menu);
  } catch (err) {
    console.error("Error updating menu:", err);
    res.status(500).json({ message: "Error updating menu", error: err.message });
  }
};

// ✅ Delete menu - ADD THIS EXPORT
export const deleteMenu = async (req, res) => {
  try {
    const menu = await Menu.findByIdAndDelete(req.params.id);
    if (!menu) return res.status(404).json({ message: "Menu not found" });
    res.json({ message: "Menu deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting menu", error: err.message });
  }
};
