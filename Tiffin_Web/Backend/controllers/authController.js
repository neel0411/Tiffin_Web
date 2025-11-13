import Customer from "../models/customer.js";
import Supplier from "../models/supplier.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ===================== REGISTER =====================
export const register = async (req, res) => {
  const { name, phone, address, email, password, role } = req.body;

  try {
    // check if email already exists
    let existingUser;
    if (role === "customer") {
      existingUser = await Customer.findOne({ email });
    } else if (role === "supplier") {
      existingUser = await Supplier.findOne({ email });
    }

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    if (role === "customer") {
      user = await Customer.create({
        name,
        phone,
        address,
        email,
        password: hashedPassword,
        role,
        status: "active",
      });
    } else if (role === "supplier") {
      user = await Supplier.create({
        name,
        phone,
        address,
        email,
        password: hashedPassword,
        role,
        status: "active",
      });
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    // create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // remove password before sending response
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.status(201).json({
      message: `${role} registered successfully`,
      token,
      role: user.role,
      user: userWithoutPassword,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===================== LOGIN =====================
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // find user from both collections
    let user = await Customer.findOne({ email });
    if (!user) {
      user = await Supplier.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // check blocked status
    if (user.status === "blocked") {
      return res.status(403).json({ message: "Account is blocked" });
    }

    // create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // remove password before sending response
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.json({
      message: "Login successful",
      token,
      role: user.role,
      user: userWithoutPassword,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
