import express from "express";
import { 
  addCategory, 
  getCategories, 
  getCategoryById,
  updateCategory,
  deleteCategory 
} from "../controllers/categoryController.js";

const router = express.Router();

router.post("/", addCategory);
router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;