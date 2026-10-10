import express from "express";

import {
  getMovieReviews,
  createOrUpdateReview,
  deleteMyReview,
} from "../controllers/review.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Tout le monde peut lire les avis
router.get("/:movieId", getMovieReviews);

// Seuls les utilisateurs connectés peuvent publier ou modifier un avis
router.post("/:movieId", protect, createOrUpdateReview);

// Seuls les utilisateurs connectés peuvent supprimer leur avis
router.delete("/:movieId", protect, deleteMyReview);

export default router;
