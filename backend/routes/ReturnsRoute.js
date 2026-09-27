import express from "express";
import { requireAdmin } from "../middleware/auth.js";
import { Return } from "../models/ReturnsModel.js";

const ReturnRouter = express.Router();

ReturnRouter.post("/", async (request, response) => {
    try {
        const { productId, orderId, reason, refundAmount, returnDate, email } =
            request.body;

        if (
            !productId ||
            !orderId ||
            !reason ||
            !refundAmount ||
            !returnDate ||
            !email
        ) {
            return response.status(400).send({
                message:
                    "Send all required fields: productId, orderId, reason, refundAmount, returnDate, email",
            });
        }

        const newReturn = {
            productId,
            orderId,
            reason,
            refundAmount,
            returnDate,
            email,
        };
        const returnProduct = await Return.create(newReturn);
        return response.status(201).send(returnProduct);
    } catch (error) {
        console.error(error);
        response.status(500).send({ message: error.message });
    }
});

ReturnRouter.get("/", async (request, response) => {
    try {
        const returns = await Return.find({});
        return response.status(200).json({
            count: returns.length,
            data: returns,
        });
    } catch (error) {
        console.error(error);
        response.status(500).send({ message: error.message });
    }
});

ReturnRouter.get("/:id", async (request, response) => {
    try {
        const { id } = request.params;
        const returnProduct = await Return.findById(id);

        if (!returnProduct) {
            return response.status(404).json({ message: "Return not found" });
        }

        return response.status(200).json(returnProduct);
    } catch (error) {
        console.error(error);
        response.status(500).send({ message: error.message });
    }
});

ReturnRouter.put("/:id", requireAdmin, async (request, response) => {
    try {
        const { id } = request.params;
        const { productId, orderId, reason, refundAmount, returnDate, email } =
            request.body;

        if (
            !productId ||
            !orderId ||
            !reason ||
            !refundAmount ||
            !returnDate ||
            !email
        ) {
            return response.status(400).send({
                message:
                    "Send all required fields: productId, orderId, reason, refundAmount",
            });
        }

        const updatedReturn = await Return.findByIdAndUpdate(id, request.body, {
            new: true,
        });

        if (!updatedReturn) {
            return response.status(404).json({ message: "Return not found" });
        }

        return response.status(200).send({
            message: "Return updated successfully",
            data: updatedReturn,
        });
    } catch (error) {
        console.error(error);
        response.status(500).send({ message: error.message });
    }
});

ReturnRouter.delete("/:id", requireAdmin, async (request, response) => {
    try {
        const { id } = request.params;
        const result = await Return.findByIdAndDelete(id);

        if (!result) {
            return response.status(404).json({ message: "Return not found" });
        }

        return response
            .status(200)
            .send({ message: "Return deleted successfully" });
    } catch (error) {
        console.error(error);
        response.status(500).send({ message: error.message });
    }
});

export default ReturnRouter;
