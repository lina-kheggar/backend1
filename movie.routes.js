// src/routes/movie.routes.js

import express from "express";

import {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} from "../controllers/movie.controller.js";

const router = express.Router();

import { protect } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";
// Consulter tous les films et séries
router.get("/", getAllMovies);

// Consulter un film ou une série
router.get("/:id", getMovieById);

// Ajouter un film ou une série
router.post("/", protect, adminOnly, createMovie);
// Modifier un film ou une série
router.patch("/:id", protect, adminOnly, updateMovie);

// Supprimer un film ou une série
router.delete("/:id", protect, adminOnly, deleteMovie);

export default router;