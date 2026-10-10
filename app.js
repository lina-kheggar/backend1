// src/app.js

import express from "express";
import cors from "cors";

import userRoutes from "./routes/user.routes.js";
import movieRoutes from "./routes/movie.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import chatRoutes from "./routes/chat.routes.js";

const app = express();

// Autoriser le frontend à communiquer avec le backend
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://127.0.0.1:5500",
    credentials: true,
  })
);

// Lire les données envoyées en JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route d'accueil
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Bienvenue sur le backend de films et séries !",
  });
});

// Vérifier que le serveur fonctionne
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Le serveur fonctionne correctement.",
  });
});

// Brancher les routes
app.use("/api/users", userRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/chat", chatRoutes);

// Route inconnue
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route introuvable : ${req.method} ${req.originalUrl}`,
  });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error("Erreur serveur :", err.message);

  res.status(err.status || 500).json({
    success: false,
    message:
      err.status && err.status < 500
        ? err.message
        : "Une erreur interne est survenue.",
  });
});

export default app;