import express from "express";
import { requireAdmin } from "../middleware/auth.js";
import nodemailer from "nodemailer";
import { Ticket } from "../models/ticketModel.js";

const ticketRouter = express.Router();

ticketRouter.post("/", async (request, response) => {
    try {
        if (
            !request.body.topic ||
            !request.body.description ||
            !request.body.name ||
            !request.body.phone ||
            !request.body.email
        ) {
            return response.status(400).send({
                message: "Send all required fields",
            });
        }
        const newTicket = {
            topic: request.body.topic,
            description: request.body.description,
            name: request.body.name,
            phone: request.body.phone,
            email: request.body.email,
        };
        const ticket = await Ticket.create(newTicket);
        return response.status(201).send(ticket);
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

ticketRouter.get("/", async (request, response) => {
    try {
        const tickets = await Ticket.find({});
        return response.status(200).json({
            count: tickets.length,
            data: tickets,
        });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

ticketRouter.get("/:id", async (request, response) => {
    try {
        const { id } = request.params;
        const ticket = await Ticket.findById(id);
        return response.status(200).json(ticket);
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

ticketRouter.put("/:id", requireAdmin, async (request, response) => {
    try {
        if (
            !request.body.topic ||
            !request.body.description ||
            !request.body.email
        ) {
            return response.status(400).send({
                message: "Send all required fields",
            });
        }
        const { id } = request.params;
        const result = await Ticket.findByIdAndUpdate(id, request.body);

        if (!result) {
            return response.status(400).json({ message: "Ticket not found" });
        }
        return response
            .status(200)
            .send({ message: "Ticket updated successfully" });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

ticketRouter.delete("/:id", requireAdmin, async (request, response) => {
    try {
        const { id } = request.params;
        const result = await Ticket.findByIdAndDelete(id);

        if (!result) {
            return response.status(400).json({ message: "Ticket not found" });
        }

        return response
            .status(200)
            .send({ message: "Ticket deleted successfully" });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

ticketRouter.post("/:id/reply", requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;

        // Update ticket with reply and set status to solved
        const ticket = await Ticket.findByIdAndUpdate(
            id,
            {
                $push: { replies: { message } },
                status: "solved",
            },
            { new: true }
        );

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        // Configure the nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Email details
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: ticket.email, // Send to the ticket creator's email
            subject: `Reply to your ticket: \n${ticket.topic}`,
            text: `Dear ${ticket.name},\n\nYou have received a reply to your ticket:\n\n"${message}"\n\nBest regards,\nSupport Team`,
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return res
                    .status(500)
                    .json({ message: "Failed to send email" });
            } else {
                console.log("Email sent: " + info.response);
            }
        });

        // Return success response
        res.status(200).json({
            message: "Reply sent and ticket marked as solved",
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server error" });
    }
});

export default ticketRouter;
