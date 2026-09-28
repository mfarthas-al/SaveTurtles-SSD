import express from "express";
import { requireAdmin } from "../middleware/auth.js";
import { EventParticipant } from "../models/eventParticipentModel.js";
import { EventProgram } from "../models/eventModel.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/eventPayment/"); // Save uploaded images in the 'uploads/' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename with timestamp
  },
});

const upload = multer({ storage: storage });

// Serve static files from the 'uploads' folder
router.use(
  "/uploads/eventPayment/",
  express.static(path.join(path.resolve(), "/uploads/eventPayment/"))
);

// Route for saving a new participant with an image
router.post("/", upload.single("paymentImage"), async (request, response, next) => {
  try {
    if (
      !request.body.participantName ||
      !request.body.gender ||
      !request.body.phone ||
      !request.body.email ||
      !request.body.noOfPerson ||
      !request.body.eventName ||
      !request.body.eventDate ||
      !request.body.ticketPrice
    ) {
      return response.status(400).send({
        message:
          "Send all required fields: participantName, gender, phone, email, eventName, eventDate, ticketPrice",
      });
    }

    const paymentImageUrl = request.file
      ? `/uploads/eventPayment/${request.file.filename}`
      : null;

    const newEventParticipant = {
      participantName: request.body.participantName,
      gender: request.body.gender,
      phone: request.body.phone,
      email: request.body.email,
      noOfPerson: request.body.noOfPerson,
      eventName: request.body.eventName,
      eventDate: request.body.eventDate,
      ticketPrice: request.body.ticketPrice,
      paymentImageUrl, // Add image URL to participant if available
    };

    // Find the corresponding event and update allocatedPersonCount
    const event = await EventProgram.findOne({
      eventName: request.body.eventName,
    });
    if (!event) {
      return response.status(404).send({ message: "Event not found" });
    }

    if (event.allocatedPersonCount < request.body.noOfPerson) {
      return response
        .status(400)
        .send({ message: "Not enough available seats" });
    }

    event.allocatedPersonCount -= request.body.noOfPerson;
    await event.save();

    const eventP = await EventParticipant.create(newEventParticipant);
    return response.status(201).send(eventP);
  } catch (error) {
    // =========================================================================
    // [ORIGINAL INSECURE CODE - FOR AUDIT SCREENSHOT]
    // Previously leaked raw error message:
    // console.log(error.message);
    // response.status(500).send({ message: error.message });
    // =========================================================================
    // [HARDENED FIX]: Delegate error to centralized error handling middleware
    next(error);
  }
});

// Route for getting all participants from the DB
router.get("/", async (request, response, next) => {
  try {
    const eventPs = await EventParticipant.find({});
    return response.status(200).json({
      count: eventPs.length,
      data: eventPs,
    });
  } catch (error) {
    // =========================================================================
    // [ORIGINAL INSECURE CODE - FOR AUDIT SCREENSHOT]
    // console.log(error.message);
    // response.status(500).send({ message: error.message });
    // =========================================================================
    // [HARDENED FIX]: Delegate error to centralized error handling middleware
    next(error);
  }
});

// Route for getting a participant by ID
router.get("/:id", async (request, response, next) => {
  try {
    const { id } = request.params;
    const eventP = await EventParticipant.findById(id);
    return response.status(200).json(eventP);
  } catch (error) {
    // =========================================================================
    // [ORIGINAL INSECURE CODE - FOR AUDIT SCREENSHOT]
    // console.log(error.message);
    // response.status(500).send({ message: error.message });
    // =========================================================================
    // [HARDENED FIX]: Delegate error to centralized error handling middleware
    next(error);
  }
});

// Route for updating a participant (with image update)
router.put("/:id", requireAdmin, upload.single("paymentImage"), async (request, response, next) => {
  try {
    if (
      !request.body.participantName ||
      !request.body.gender ||
      !request.body.phone ||
      !request.body.email ||
      !request.body.noOfPerson ||
      !request.body.eventName ||
      !request.body.eventDate ||
      !request.body.ticketPrice
    ) {
      return response.status(400).send({
        message:
          "Send all required fields: participantName, gender, phone, email, eventName, eventDate, ticketPrice",
      });
    }

    const { id } = request.params;
    const paymentImageUrl = request.file
      ? `/uploads/eventPayment/${request.file.filename}`
      : request.body.paymentImageUrl;

    const updatedEventParticipant = {
      ...request.body,
      paymentImageUrl, // Update the image URL if a new image is uploaded
    };

    const result = await EventParticipant.findByIdAndUpdate(
      id,
      updatedEventParticipant,
      { new: true }
    );

    if (!result) {
      return response
        .status(404)
        .json({ message: "Event Participant not found" });
    }

    return response.status(200).send({
      message: "Event Participant updated successfully",
      participant: result,
    });
  } catch (error) {
    // =========================================================================
    // [ORIGINAL INSECURE CODE - FOR AUDIT SCREENSHOT]
    // console.log(error.message);
    // response.status(500).send({ message: error.message });
    // =========================================================================
    // [HARDENED FIX]: Delegate error to centralized error handling middleware
    next(error);
  }
});

// Route for deleting a participant
router.delete("/:id", requireAdmin, async (request, response, next) => {
  try {
    const { id } = request.params;
    const result = await EventParticipant.findByIdAndDelete(id);

    if (!result) {
      return response
        .status(404)
        .json({ message: "Event Participant not found" });
    }

    return response
      .status(200)
      .send({ message: "Event Participant deleted successfully" });
  } catch (error) {
    // =========================================================================
    // [ORIGINAL INSECURE CODE - FOR AUDIT SCREENSHOT]
    // console.log(error.message);
    // response.status(500).send({ message: error.message });
    // =========================================================================
    // [HARDENED FIX]: Delegate error to centralized error handling middleware
    next(error);
  }
});

export default router;
