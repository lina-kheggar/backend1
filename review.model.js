import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },

    rating: {
      type: Number,
      required: [true, "La note est obligatoire"],
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Un utilisateur ne peut laisser qu'un seul avis par film ou série.
reviewSchema.index({ user: 1, movie: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);

export default Review;