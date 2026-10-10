// src/routes/chat.routes.js

import express from "express";

import {
  sendMessage,
} from "../controllers/chat.controller.js";

const router = express.Router();

// Envoyer un message au chatbot
router.post("/", sendMessage);

export default router;