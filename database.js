import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error("La variable MONGO_URI manque dans le fichier .env");
    }

    await mongoose.connect(mongoURI);

    console.log("MongoDB connecté avec succès !");
  } catch (error) {
    console.error("Erreur de connexion MongoDB :", error.message);
    throw error;
  }
};

export default connectDB;