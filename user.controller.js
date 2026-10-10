import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Movie from "../models/movie.model.js";

// Créer un compte
export const registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Nom, email et mot de passe obligatoires.",
      });
    }

    if (username.trim().length < 3 || username.trim().length > 30) {
      return res.status(400).json({
        success: false,
        message: "Le nom doit contenir entre 3 et 30 caractères.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Le mot de passe doit contenir au moins 8 caractères.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Cette adresse email est déjà utilisée.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      username: username.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "Compte créé avec succès.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Cette adresse email est déjà utilisée.",
      });
    }

    next(error);
  }
};

// Se connecter
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email et mot de passe obligatoires.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect.",
      });
    }

    const passwordIsValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect.",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET manque dans le fichier .env");
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      message: "Connexion réussie.",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Consulter son profil
export const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur introuvable.",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Modifier son profil
export const updateMyProfile = async (req, res, next) => {
  try {
    const updates = {};

    if (typeof req.body.username === "string") {
      const username = req.body.username.trim();

      if (username.length < 3 || username.length > 30) {
        return res.status(400).json({
          success: false,
          message: "Le nom doit contenir entre 3 et 30 caractères.",
        });
      }

      updates.username = username;
    }

    if (typeof req.body.avatar === "string") {
      updates.avatar = req.body.avatar.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Aucune modification valide fournie.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur introuvable.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profil mis à jour.",
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Ajouter un film ou une série à sa watchlist
export const addToWatchlist = async (req, res, next) => {
  try {
    const { movieId } = req.params;

    if (!mongooseIdIsValid(movieId)) {
      return res.status(400).json({
        success: false,
        message: "Identifiant de titre invalide.",
      });
    }

    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Film ou série introuvable.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $addToSet: { watchlist: movie._id } },
      { new: true }
    ).select("watchlist");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur introuvable.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Titre ajouté à votre watchlist.",
      watchlist: user.watchlist,
    });
  } catch (error) {
    next(error);
  }
};

// Consulter sa watchlist avec les détails des titres
export const getWatchlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("watchlist")
      .populate("watchlist");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur introuvable.",
      });
    }

    res.status(200).json({
      success: true,
      watchlist: user.watchlist,
    });
  } catch (error) {
    next(error);
  }
};

// Retirer un titre de la watchlist
export const removeFromWatchlist = async (req, res, next) => {
  try {
    const { movieId } = req.params;

    if (!mongooseIdIsValid(movieId)) {
      return res.status(400).json({
        success: false,
        message: "Identifiant de titre invalide.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $pull: { watchlist: movieId } },
      { new: true }
    ).select("watchlist");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur introuvable.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Titre retiré de votre watchlist.",
      watchlist: user.watchlist,
    });
  } catch (error) {
    next(error);
  }
};

// Ajouter un film ou une série aux favoris
export const addToFavorites = async (req, res, next) => {
  try {
    const { movieId } = req.params;

    if (!mongooseIdIsValid(movieId)) {
      return res.status(400).json({
        success: false,
        message: "Identifiant de titre invalide.",
      });
    }

    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Film ou série introuvable.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $addToSet: { favorites: movie._id } },
      { new: true }
    ).select("favorites");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur introuvable.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Titre ajouté aux favoris.",
      favorites: user.favorites,
    });
  } catch (error) {
    next(error);
  }
};

// Retirer un titre des favoris
export const removeFromFavorites = async (req, res, next) => {
  try {
    const { movieId } = req.params;

    if (!mongooseIdIsValid(movieId)) {
      return res.status(400).json({
        success: false,
        message: "Identifiant de titre invalide.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $pull: { favorites: movieId } },
      { new: true }
    ).select("favorites");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur introuvable.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Titre retiré des favoris.",
      favorites: user.favorites,
    });
  } catch (error) {
    next(error);
  }
};

// Vérifier un identifiant MongoDB
function mongooseIdIsValid(id) {
  return /^[a-f\d]{24}$/i.test(id);
}
