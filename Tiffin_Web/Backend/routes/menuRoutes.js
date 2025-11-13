// routes/menuRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import { 
  getMenus, 
  getMenuById, 
  addMenu, 
  updateMenu, 
  deleteMenu  // Make sure this import is correct
} from "../controllers/menuController.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/menu/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'menu-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// All menus
router.get("/", getMenus);

// Get single menu by ID
router.get("/:id", getMenuById);

// Add new menu (with file upload)
router.post("/", upload.single('menu_image'), addMenu);

// Update menu (with optional file upload)
router.put("/:id", upload.single('menu_image'), updateMenu);

// Delete menu
router.delete("/:id", deleteMenu);

export default router;