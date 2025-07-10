// importer mongoose pour qu'il creer des collections
const mongoose = require("mongoose");
// creer un schema
const categorieSchema = mongoose.Schema({
  nomcategorie: { type: String, required: true, unique: true },
  imagecategorie: { type: String, required: false },
});
// exporter le modele categorie
module.exports = mongoose.model("categorie", categorieSchema);
