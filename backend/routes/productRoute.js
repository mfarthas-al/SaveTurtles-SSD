import express from "express";
import { requireAdmin } from "../middleware/auth.js";
import { Product } from "../models/productModel.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/productImage/'); // Save uploaded images in the 'uploads/' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename with timestamp
  }
});

const upload = multer({ storage: storage });

// Serve static files from the 'uploads' folder
router.use('/uploads/productImage/', express.static(path.join(path.resolve(), 'uploads/productImage/')));

// Route for saving a new product with an image
router.post("/", requireAdmin, upload.single('image'), async (request, response) => {
  try {
    if (
      !request.body.name ||
      !request.body.description ||
      !request.body.price ||
      !request.body.stockQuantity ||
      !request.body.category
    ) {
      return response.status(400).send({
        message: "Send all required fields: name, description, price, stockQuantity, category",
      });
    }

    const imageUrl = request.file ? `/uploads/productImage/${request.file.filename}` : null;

    const newProduct = {
      name: request.body.name,
      description: request.body.description,
      price: request.body.price,
      stockQuantity: request.body.stockQuantity,
      category: request.body.category,
      imageUrl, // Add image URL to product if available
      isSoldOut: request.body.stockQuantity <= 0, // Add isSoldOut field
    };

    const product = await Product.create(newProduct);
    return response.status(201).send(product);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route for getting all products from the DB
router.get("/", async (request, response) => {
  try {
    const products = await Product.find({}).sort({ stockQuantity: -1 }); // Sort by stockQuantity in descending order
    return response.status(200).json({
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route for getting a product by ID
router.get("/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const product = await Product.findById(id);
    return response.status(200).json(product);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route for updating a product (with image update)
router.put("/:id", requireAdmin, upload.single('image'), async (request, response) => {
  try {
    if (
      !request.body.name ||
      !request.body.description ||
      !request.body.price ||
      !request.body.stockQuantity ||
      !request.body.category
    ) {
      return response.status(400).send({
        message: "Send all required fields: name, description, price, stockQuantity, category",
      });
    }

    const { id } = request.params;
    const imageUrl = request.file ? `/uploads/productImage/${request.file.filename}` : request.body.imageUrl;

    const updatedProduct = {
      ...request.body,
      imageUrl, // Update the image URL if a new image is uploaded
      isSoldOut: request.body.stockQuantity <= 0, // Update isSoldOut status
    };

    const result = await Product.findByIdAndUpdate(id, updatedProduct, { new: true });

    if (!result) {
      return response.status(400).json({ message: "Product not found" });
    }

    return response.status(200).send({ message: "Product updated successfully", product: result });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route for deleting a product
router.delete("/:id", requireAdmin, async (request, response) => {
  try {
    const { id } = request.params;
    const result = await Product.findByIdAndDelete(id);

    if (!result) {
      return response.status(400).json({ message: "Product not found" });
    }

    return response.status(200).send({ message: "Product deleted successfully" });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

export default router;