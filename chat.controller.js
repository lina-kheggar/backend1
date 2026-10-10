// src/controllers/chat.controller.js

export const sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;

    // Vérifier que le message existe
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Veuillez écrire un message.",
      });
    }

    // Vérifier la longueur du message
    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Votre message ne doit pas dépasser 2000 caractères.",
      });
    }

    // Réponse temporaire en attendant de connecter une IA
    return res.status(200).json({
      success: true,
      userMessage: message.trim(),
      reply:
        "Bonjour ! Je suis ton assistant cinéma. " +
        "La connexion à l'intelligence artificielle reste à configurer.",
    });
  } catch (error) {
    next(error);
  }
};