const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  voitureId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Voiture" },
  clientNom: { type: String, required: true },
  dateDebut: { type: Date, required: true },
  dateFin: { type: Date, required: true },
  prix: { type: Number, required: true },
});

const Location = mongoose.model("Location", locationSchema);

module.exports = Location;
