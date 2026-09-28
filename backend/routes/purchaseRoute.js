import express from "express";
import { requireAdmin } from "../middleware/auth.js";
import { Purchase } from "../models/purchaseModel.js";
import { Product } from "../models/productModel.js";
import multer from "multer";
import path from "path";

import { createSecureUpload } from "../middleware/upload.js";

const router = express.Router();

// =========================================================================
// [ORIGINAL INSECURE CODE - FOR AUDIT SCREENSHOT]
// Previously, raw user filenames, unbounded file size, and no MIME/ext filters:
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/purchasePayment/');
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + '-' + file.originalname);
//     }
// });
// const upload = multer({ storage: storage });
// =========================================================================
// [HARDENED FIX]: Centralized secure upload with UUID naming, type allowlist, and 5MB limit
const upload = createSecureUpload("uploads/purchasePayment/");

// Route for saving a new purchase with an image and stock update
router.post("/", upload.single('image'), async (request, response) => {
    try {
        if (
            !request.body.customerName ||
            !request.body.email ||
            !request.body.phone ||
            !request.body.address ||
            !request.body.productName ||
            !request.body.quantity ||
            !request.body.productSize ||
            !request.body.productPrice ||
            !request.body.totalPrice
        ) {
            return response.status(400).send({
                message: "Send all required fields: customerName, email, phone, address, productName, quantity, productSize, productPrice, totalPrice",
            });
        }

        const { productName, quantity } = request.body;

        // Check if product exists and has enough stock
        const product = await Product.findOne({ name: productName });
        if (!product) {
            return response.status(404).json({ message: "Product not found" });
        }

        if (product.stockQuantity < quantity) {
            return response.status(400).json({ 
                message: 'Not enough stock available',
                availableQuantity: product.stockQuantity
            });
        }

        const paymentSlipUrl = request.file ? `/uploads/purchasePayment/${request.file.filename}` : null;

        // Automatically capture the current date as the purchaseDate
        const purchaseDate = new Date();

        const newPurchase = {
            customerName: request.body.customerName,
            email: request.body.email,
            phone: request.body.phone,
            address: request.body.address,
            productName: request.body.productName,
            quantity: request.body.quantity,
            productSize: request.body.productSize,
            productPrice: request.body.productPrice,
            totalPrice: request.body.totalPrice,
            approvalStatus: request.body.approvalStatus || null,
            paymentSlipUrl,
            purchaseDate,
        };

        const purchase = await Purchase.create(newPurchase);

        // Update product stock
        product.stockQuantity -= quantity;
        await product.save();

        return response.status(201).send(purchase);
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// Route for getting all purchases
router.get("/", async (request, response) => {
    try {
        const purchases = await Purchase.find({});
        return response.status(200).json({
            count: purchases.length,
            data: purchases,
        });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// Route for getting a purchase by ID
router.get("/:id", async (request, response) => {
    try {
        const { id } = request.params;
        const purchase = await Purchase.findById(id);
        if (!purchase) {
            return response.status(404).json({ message: "Purchase not found" });
        }
        return response.status(200).json(purchase);
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// Route for updating a purchase (with image update)
router.put("/:id", requireAdmin, upload.single("paymentImage"), async (request, response) => {
    try {
        if (
            !request.body.customerName ||
            !request.body.email ||
            !request.body.phone ||
            !request.body.address ||
            !request.body.productName ||
            !request.body.quantity ||
            !request.body.productSize ||
            !request.body.productPrice ||
            !request.body.totalPrice
        ) {
            return response.status(400).send({
                message: "Send all required fields: customerName, email, phone, address, productName, quantity, productSize, productPrice, totalPrice",
            });
        }

        const { id } = request.params;
        const paymentSlipUrl = request.file
            ? `/uploads/purchasePayment/${request.file.filename}`
            : request.body.paymentSlipUrl;

        const updatedPurchase = {
            ...request.body,
            paymentSlipUrl,
        };

        const result = await Purchase.findByIdAndUpdate(
            id,
            updatedPurchase,
            { new: true }
        );

        if (!result) {
            return response
                .status(404)
                .json({ message: "Purchase not found" });
        }

        return response.status(200).send({
            message: "Purchase updated successfully",
            purchase: result,
        });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// Route for deleting a purchase
router.delete("/:id", requireAdmin, async (request, response) => {
    try {
        const { id } = request.params;
        const result = await Purchase.findByIdAndDelete(id);

        if (!result) {
            return response
                .status(404)
                .json({ message: "Purchase not found" });
        }

        return response
            .status(200)
            .send({ message: "Purchase deleted successfully" });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

router.put("/updateApprovalStatus/:id", requireAdmin, async (request, response) => {
    try {
        const { id } = request.params;
        const { approvalStatus } = request.body;

        if (!approvalStatus) {
            return response.status(400).send({
                message: "Approval status is required",
            });
        }

        const result = await Purchase.findByIdAndUpdate(
            id,
            { approvalStatus },
            { new: true }
        );

        if (!result) {
            return response
                .status(404)
                .json({ message: "Purchase not found" });
        }

        return response.status(200).send({
            message: "Approval status updated successfully",
            purchase: result,
        });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

export default router;