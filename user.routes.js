// src/routes/user.routes.js
import { protect } from "../middleware/auth.middleware.js";
import express from "express";

import {
  registerUser,
  loginUser,
  getMyProfile,
  updateMyProfile,
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
  addToFavorites,
  removeFromFavorites,
} from "../controllers/user.controller.js";

const router = express.Router();

// Inscription et connexion
router.post("/register", registerUser);
router.post("/login", loginUser);

// Profil utilisateur
router.get("/profile", protect, getMyProfile);
router.patch("/profile", protect, updateMyProfile);

// Liste des films à regarder
router.get("/watchlist", protect, getWatchlist);
router.post("/watchlist/:movieId", protect, addToWatchlist);
router.delete("/watchlist/:movieId", protect, removeFromWatchlist);

// Films favoris
router.post("/favorites/:movieId", protect, addToFavorites);
router.delete("/favorites/:movieId", protect, removeFromFavorites);
export default router;