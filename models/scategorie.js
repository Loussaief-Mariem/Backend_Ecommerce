const mongoose = require("mongoose");
const Categorie = require("./categorie.js");
const scategorieSchema = mongoose.Schema({
  nomscategorie: { type: String, required: true },
  imagescat: { type: String, required: false },
  categorieID: { type: mongoose.Schema.Types.ObjectId, ref: Categorie },
});
//  {type:mongoose.Schema.Types.ObjectId, ref:Categorie : cle etragere

module.exports = mongoose.model("scategorie", scategorieSchema);
