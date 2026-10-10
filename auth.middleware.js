// src/middleware/auth.middleware.js

import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Vous devez être connecté.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'utilisateur dans MongoDB
    const user = await User.findById(decoded.userId).select("_id role");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur introuvable. Veuillez vous reconnecter.",
      });
    }

    // Transmettre son identifiant et son rôle aux routes
    req.user = {
      userId: user._id.toString(),
      role: user.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token invalide ou expiré. Veuillez vous reconnecter.",
    });
  }
};