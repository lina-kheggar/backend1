import mongoose from "mongoose";
import Review from "../models/review.model.js";
import Movie from "../models/movie.model.js";

// Recalculer la note moyenne d'un film ou d'une série
const updateMovieRating = async (movieId) => {
  const result = await Review.aggregate([
    {
      $match: {
        movie: new mongoose.Types.ObjectId(movieId),
      },
    },
    {
      $group: {
        _id: "$movie",
        averageRating: { $avg: "$rating" },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  const averageRating = result[0]?.averageRating ?? 0;
  const ratingCount = result[0]?.ratingCount ?? 0;

  await Movie.findByIdAndUpdate(movieId, {
    $set: {
      averageRating: Math.round(averageRating * 10) / 10,
      ratingCount,
    },
  });
};

// Consulter les avis d'un film ou d'une série
export const getMovieReviews = async (req, res, next) => {
  try {
    const { movieId } = req.params;

    if (!mongoose.isValidObjectId(movieId)) {
      return res.status(400).json({
        success: false,
        message: "Identifiant invalide.",
      });
    }

    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Film ou série introuvable.",
      });
    }

    const reviews = await Review.find({ movie: movieId })
      .populate("user", "username avatar")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// Ajouter un avis ou modifier son avis existant
export const createOrUpdateReview = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const { rating, comment = "" } = req.body;

    if (!mongoose.isValidObjectId(movieId)) {
      return res.status(400).json({
        success: false,
        message: "Identifiant invalide.",
      });
    }

    if (
      typeof rating !== "number" ||
      !Number.isFinite(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "La note doit être un nombre entre 1 et 5.",
      });
    }

    if (
      typeof comment !== "string" ||
      comment.length > 2000
    ) {
      return res.status(400).json({
        success: false,
        message: "Le commentaire doit contenir au maximum 2000 caractères.",
      });
    }

    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Film ou série introuvable.",
      });
    }

    const review = await Review.findOneAndUpdate(
      {
        user: req.user.userId,
        movie: movieId,
      },
      {
        $set: {
          rating,
          comment: comment.trim(),
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    await updateMovieRating(movieId);

    res.status(200).json({
      success: true,
      message: "Votre avis a été enregistré.",
      review,
    });
  } catch (error) {
    next(error);
  }
};

// Supprimer son propre avis
export const deleteMyReview = async (req, res, next) => {
  try {
    const { movieId } = req.params;

    if (!mongoose.isValidObjectId(movieId)) {
      return res.status(400).json({
        success: false,
        message: "Identifiant invalide.",
      });
    }

    const review = await Review.findOneAndDelete({
      user: req.user.userId,
      movie: movieId,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Aucun avis personnel trouvé pour ce titre.",
      });
    }

    await updateMovieRating(movieId);

    res.status(200).json({
      success: true,
      message: "Votre avis a été supprimé.",
    });
  } catch (error) {
    next(error);
  }
};
