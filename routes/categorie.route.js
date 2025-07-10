const express = require("express");
const Categorie = require("../models/categorie");
const router = express.Router();
// la methode get revoiyer la liste des categorie a l'utilisateur
router.get("/", async (req, res) => {
  try {
    const categorie = await Categorie.find();

    res.status(200).json(categorie); // permet aussi de retourner le categorie
  } catch (error) {
    console.Log(error);
  }
});
// la methode gost pour ajouter une categorie
// les attributs de categorie va prendre les valeur a partie d'un formulaire ou thunder client ou post man??
// les valeur de l'atribut jayinn me, request de la user
router.post("/", async (req, res) => {
  /*  MT1
   const { nomcategorie, imagecategorie } = req.body;
  const cat = new Categorie({
    nomcategorie: nomcategorie,
    imagecategorie: imagecategorie,
  });  */

  /*   MT2
  const cat = new Categorie({
    nomcategorie: req.body.nomcategorie,
    imagecategorie:  req.body.imagecategorie,
  }); */

  // MT3
  const cat = new Categorie(req.body);
  try {
    // await :
    await cat.save();
    //  status(200)
    res.status(200).json(cat);
  } catch (error) {
    // timeLog  :
    console.Log(error);
  }
});

router.get("/:id", (req, res) => {});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  await Categorie.findByIdAndDelete(id);
  res.json({ message: "categorie deleted successfully." });
});
router.put("/:id", async (req, res) => {
  try {
    const cat1 = await Categorie.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      // new: true -> pour afficheir la nouvelle version de cat
      { new: true }
    );
    res.status(200).json(cat1);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});
module.exports = router;
