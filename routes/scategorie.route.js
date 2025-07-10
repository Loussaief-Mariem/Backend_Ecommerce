const express = require("express");
const Scategorie = require("../models/scategorie");
const router = express.Router();
// la methode get revoiyer la liste des scategorie a l'utilisateur
router.get("/", async (req, res) => {
  try {
    const scategorie = await Scategorie.find({}, null, {
      sort: { _id: -1 },
    }).populate("categorieID");
    // populate : tjib les information de categorie koll ya3ni tjib l'objet kamel a partir de l'id

    res.status(200).json(scategorie);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});
//nomscategorie: { type: String, required: true },
//imagescat: { type: String, required: false },
//categorieID:
router.post("/", async (req, res) => {
  const scat = new Scategorie(req.body);
  try {
    await scat.save();

    res.status(200).json(scat);
  } catch (error) {
    console.Log(error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const scat = await Scategorie.findById(req.params.id);
    res.status(200).json(scat);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  await Scategorie.findByIdAndDelete(id);
  res.json({ message: "Scategorie deleted successfully." });
});
router.put("/:id", async (req, res) => {
  try {
    const scat1 = await Scategorie.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      // new: true -> pour afficheir la nouvelle version de cat
      { new: true }
    );
    res.status(200).json(scat1);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});
// chercher une sous catégorie par cat
router.get("/cat/:categorieID", async (req, res) => {
  try {
    const scat = await SCategorie.find({
      categorieID: req.params.categorieID,
    }).exec();
    res.status(200).json(scat);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});
module.exports = router;
