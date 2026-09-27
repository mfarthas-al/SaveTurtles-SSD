import express from "express";
import { EventProgram } from "../models/eventModel.js";

const router = express.Router();

//Route for save a new event
router.post("/", async (request, response) => {
  try {
    if (
      !request.body.eventName ||
      !request.body.vanue ||
      !request.body.date ||
      !request.body.time ||
      !request.body.allocatedPersonCount ||
      !request.body.price
    ) {
      return response.status(400).send({
        message: "Send all required fields: titles: eventName,vanue,date,price",
      });
    }
    const newEvent = {
      eventName: request.body.eventName,
      vanue: request.body.vanue,
      date: request.body.date,
      time: request.body.time,
      allocatedPersonCount: request.body.allocatedPersonCount,
      price: request.body.price,
    };
    const eventProgram = await EventProgram.create(newEvent);
    return response.status(201).send(eventProgram);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

//Route for get all events from the DB
router.get("/", async (request, response) => {
  try {
    const events = await EventProgram.find({});
    return response.status(200).json({
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

//Route for get all events from the DB
router.get("/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const eventProgram = await EventProgram.findById(id);
    return response.status(200).json(eventProgram);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

//Route Update a events
router.put("/:id", async (request, response) => {
  try {
    if (
      !request.body.eventName ||
      !request.body.vanue ||
      !request.body.date ||
      !request.body.time ||
      !request.body.allocatedPersonCount ||
      !request.body.price
    ) {
      return response.status(400).send({
        message:
          "Send all required fields: titles: eventName,vanue,date,time,price",
      });
    }
    const { id } = request.params;
    // Same fix as ticketRoutes.js: only pass through the fields we actually
    // validated above, not the raw body.
    const editableFields = {
      eventName: request.body.eventName,
      vanue: request.body.vanue,
      date: request.body.date,
      time: request.body.time,
      allocatedPersonCount: request.body.allocatedPersonCount,
      price: request.body.price,
    };
    const result = await EventProgram.findByIdAndUpdate(id, editableFields);

    if (!result) {
      return response.status(400).json({ message: "Event not found" });
    }
    return response.status(200).send({ message: "Event Updated succesfully" });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

//Route for Delete a events
router.delete("/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const result = await EventProgram.findByIdAndDelete(id);

    if (!result) {
      return response.status(400).json({ message: "Event not found" });
    }

    return response.status(200).send({ message: "Event Deleted succesfully" });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

export default router;
