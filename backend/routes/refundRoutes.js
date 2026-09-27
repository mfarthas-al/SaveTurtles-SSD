import express from "express";
import { Refund } from "../models/refundModel.js";

const router = express.Router();

//Route for save a new refund
router.post("/", async (request, response) => {
  try {
    if (
      !request.body.eventName ||
      !request.body.userId ||
      !request.body.amount ||
      !request.body.reason ||
      !request.body.email
    ) {
      return response.status(400).send({
        message: "Send all required fields: titles: title,author,publishYear",
      });
    }
    const newRefund = {
      eventName: request.body.eventName,
      userId: request.body.userId,
      amount: request.body.amount,
      reason: request.body.reason,
      email: request.body.email,
    };
    const refund = await Refund.create(newRefund);
    return response.status(201).send(refund);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

//Route for get all books from the DB
router.get("/", async (request, response) => {
  try {
    const refunds = await Refund.find({});
    return response.status(200).json({
      count: refunds.length,
      data: refunds,
    });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

//Route for get all books from the DB
router.get("/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const refund = await Refund.findById(id);
    return response.status(200).json(refund);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

//Route Update a book
router.put("/:id", async (request, response) => {
  try {
    if (
      !request.body.eventName ||
      !request.body.userId ||
      !request.body.amount ||
      !request.body.reason ||
      !request.body.email
    ) {
      return response.status(400).send({
        message: "Send all required fields: titles: title,author,publishYear",
      });
    }
    const { id } = request.params;
    // Same fix as ticketRoutes.js: only pass through the fields we actually
    // validated above, not the raw body.
    const editableFields = {
      eventName: request.body.eventName,
      userId: request.body.userId,
      amount: request.body.amount,
      reason: request.body.reason,
      email: request.body.email,
    };
    const result = await Refund.findByIdAndUpdate(id, editableFields);

    if (!result) {
      return response.status(400).json({ message: "Refund not found" });
    }
    return response.status(200).send({ message: "Refund Updated succesfully" });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

//Route for Delete a Book
router.delete("/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const result = await Refund.findByIdAndDelete(id);

    if (!result) {
      return response.status(400).json({ message: "Book not found" });
    }

    return response.status(200).send({ message: "Book Deleted succesfully" });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

export default router;
