import express from "express";
import { requireAdmin } from "../middleware/auth.js";
import { faQuestions } from "../models/faqModel.js";

const faqRouter = express.Router();

faqRouter.post("/", requireAdmin, async (request, response) => {
    try {
        if (!request.body.question || !request.body.answer) {
            return response.status(400).send({
                message: "Send all required fields",
            });
        }
        const newFA = {
            question: request.body.question,
            answer: request.body.answer,
        };
        const fa = await faQuestions.create(newFA);
        return response.status(201).send(fa);
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

faqRouter.get("/", async (request, response) => {
    try {
        const fa = await faQuestions.find({});
        return response.status(200).json({
            count: fa.length,
            data: fa,
        });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

faqRouter.get("/:id", async (request, response) => {
    try {
        const { id } = request.params;
        const question = await faQuestions.findById(id);
        return response.status(200).json(question);
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

faqRouter.put("/:id", requireAdmin, async (request, response) => {
    try {
        if (!request.body.question || !request.body.answer) {
            return response.status(400).send({
                message: "Send all required fields",
            });
        }
        const { id } = request.params;
        const result = await faQuestions.findByIdAndUpdate(id, request.body);

        if (!result) {
            return response.status(400).json({ message: "Question not found" });
        }
        return response
            .status(200)
            .send({ message: "Question and Answer updated successfully" });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

faqRouter.delete("/:id", requireAdmin, async (request, response) => {
    try {
        const { id } = request.params;
        const result = await faQuestions.findByIdAndDelete(id);

        if (!result) {
            return response.status(400).json({ message: "Question not found" });
        }
        return response
            .status(200)
            .send({ message: "FAQ Deleted Successfully" });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

export default faqRouter;
