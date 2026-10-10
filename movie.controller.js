import mongoose from "mongoose";
import Movie from "../models/movie.model.js";

// Afficher tous les films et séries
export const getAllMovies = async (req, res, next) => {
  try {
    const {
      type,
      genre,
      search,
      featured,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    if (type) {
      if (!["movie", "series"].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Le type doit être movie ou series.",
        });
      }

      filter.type = type;
    }

    if (genre) {
      filter.genres = genre;
    }

    if (featured !== undefined) {
      if (!["true", "false"].includes(featured)) {
        return res.status(400).json({
          success: false,
          message: "Le paramètre featured doit être true ou false.",
        });
      }

      filter.featured = featured === "true";
    }

    if (search && search.trim()) {
      filter.$text = {
        $search: search.trim(),
      };
    }

    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(limit, 10) || 20)
    );

    const [movies, total] = await Promise.all([
      Movie.find(filter)
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize)
        .lean(),

      Movie.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: currentPage,
      pages: Math.ceil(total / pageSize),
      movies,
    });
  } catch (error) {
    next(error);
  }
};

// Afficher les détails d'un film ou d'une série
export const getMovieById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Identifiant invalide.",
      });
    }

    const movie = await Movie.findById(id).lean();

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Film ou série introuvable.",
      });
    }

    res.status(200).json({
      success: true,
      movie,
    });
  } catch (error) {
    next(error);
  }
};

// Ajouter un film ou une série (administrateur uniquement)
export const createMovie = async (req, res, next) => {
  try {
    const {
      title,
      description,
      poster,
      backdrop,
      type,
      genres,
      releaseYear,
      director,
      cast,
      duration,
      seasons,
      featured,
    } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      !["movie", "series"].includes(type)
    ) {
      return res.status(400).json({
        success: false,
        message: "Un titre et un type valide sont obligatoires.",
      });
    }

    const movie = await Movie.create({
      title: title.trim(),
      description,
      poster,
      backdrop,
      type,
      genres,
      releaseYear,
      director,
      cast,
      duration,
      seasons,
      featured,
    });

    res.status(201).json({
      success: true,
      message: "Titre ajouté au catalogue.",
      movie,
    });
  } catch (error) {
    next(error);
  }
};

// Modifier un film ou une série (administrateur uniquement)
export const updateMovie = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Identifiant invalide.",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "poster",
      "backdrop",
      "type",
      "genres",
      "releaseYear",
      "director",
      "cast",
      "duration",
      "seasons",
      "featured",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Aucune modification fournie.",
      });
    }

    if (
      updates.title !== undefined &&
      (typeof updates.title !== "string" || !updates.title.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Le titre ne peut pas être vide.",
      });
    }

    if (updates.title !== undefined) {
      updates.title = updates.title.trim();
    }

    if (
      updates.type !== undefined &&
      !["movie", "series"].includes(updates.type)
    ) {
      return res.status(400).json({
        success: false,
        message: "Le type doit être movie ou series.",
      });
    }

    const movie = await Movie.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Film ou série introuvable.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Titre mis à jour.",
      movie,
    });
  } catch (error) {
    next(error);
  }
};

// Supprimer un film ou une série (administrateur uniquement)
export const deleteMovie = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Identifiant invalide.",
      });
    }

    const movie = await Movie.findByIdAndDelete(id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Film ou série introuvable.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Titre supprimé du catalogue.",
    });
  } catch (error) {
    next(error);
  }
};
