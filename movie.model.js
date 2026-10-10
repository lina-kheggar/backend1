import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Le titre est obligatoire"],
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    poster: {
      type: String,
      default: "",
    },

    backdrop: {
      type: String,
      default: "",
    },

    type: {
      type: String,
      enum: ["movie", "series"],
      required: true,
    },

    genres: {
      type: [String],
      default: [],
    },

    releaseYear: {
      type: Number,
      min: 1888,
    },

    director: {
      type: String,
      default: "",
    },

    cast: {
      type: [String],
      default: [],
    },

    duration: {
      type: Number,
      min: 1,
    },

    seasons: {
      type: Number,
      min: 1,
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

movieSchema.index({ title: "text", description: "text" });

const Movie = mongoose.model("Movie", movieSchema);

export default Movie;