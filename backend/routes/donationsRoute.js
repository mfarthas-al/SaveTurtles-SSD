import express from "express";
import { requireAdmin } from "../middleware/auth.js";
import { Donation } from "../models/donationModel.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/receipts/"); // Save uploaded images in the 'uploads/' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename with timestamp
  },
});

const upload = multer({ storage: storage });

// Serve static files from the 'uploads' folder
router.use(
  "/uploads/receipts/",
  express.static(path.join(path.resolve(), "/uploads/receipts/"))
);


//Route for save a new book
router.post("/", upload.single("paymentImage"),async (request, response) => {
  try {
    if (
      !request.body.donorName ||
      !request.body.email ||
      !request.body.contactNo ||
      !request.body.amount ||
      !request.body. dateOfPayment||
      !request.body.discription
      
    ) {
      return response.status(400).send({
        message: "Send all required fields: titles: title,author,publishYear",
      });
    }

    const paymentImageUrl = request.file
  ? `/uploads/receipts/${request.file.filename}`
  : null;

    const newDonation = {
      donorName: request.body.donorName,
      email: request.body.email,
      contactNo: request.body.contactNo,
      amount:request.body.amount,
      dateOfPayment: request.body.dateOfPayment,
      discription:request.body.discription,
      paymentImageUrl,
    };
    const donation = await Donation.create(newDonation);
    return response.status(201).send(donation);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

//Route for get all books from the DB
router.get("/", async (request, response) => {
  try {
    const donations = await Donation.find({});
    return response.status(200).json({
      count: donations.length,
      data: donations,
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
    const donation = await Donation.findById(id);
    return response.status(200).json(donation);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

//Route Update a book
router.put("/:id", requireAdmin, upload.single("paymentImage"),async (request, response) => {
  try {
    if (
      !request.body.donorName ||
      !request.body.email ||
      !request.body.contactNo||
      !request.body.amount ||
      !request.body. dateOfPayment||
      !request.body.discription
    ) {
      return response.status(400).send({
        message: "Send all required fields: titles: title,author,publishYear",
      });
    }
    const { id } = request.params;
    const paymentImageUrl = request.file
      ? `/uploads/receipts/${request.file.filename}`
      : request.body.paymentImageUrl;

    const updatedDonor = {
      ...request.body,
      paymentImageUrl, // Update the image URL if a new image is uploaded
    };

    const result = await Donation.findByIdAndUpdate(id, updatedDonor,
      { new: true }
    );

    if (!result) {
      return response.status(400).json({ message: "Book not found" });
    }
    return response.status(200).send({ message: "Book Updated succesfully" });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

//Route for Delete a Book
router.delete("/:id", requireAdmin, async (request, response) => {
  try {
    const { id } = request.params;
    const result = await Donation.findByIdAndDelete(id);

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
