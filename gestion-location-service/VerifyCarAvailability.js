const axios = require("axios");

const verifierDisponibiliteVoiture = async (carId) => {
  try {
    // URL du microservice de gestion de voitures
    const url = `http://localhost:3001/cars/${carId}/Availability`;

    const response = await axios.get(url);

    // Retourner true ou false en fonction de la disponibilité de la voiture
    return response.data.availability;
  } catch (error) {
    console.error("Erreur lors de la vérification de la disponibilité de la voiture:", error);
    return false; // Retourner false en cas d'erreur
  }
};

module.exports = verifierDisponibiliteVoiture;

