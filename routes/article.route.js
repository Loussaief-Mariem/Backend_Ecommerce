const express = require("express");
const Article = require("../models/article");
const router = express.Router();
const Scategorie = require("../models/scategorie");
// la methode get revoiyer la liste des Article a l'utilisateur
router.get("/", async (req, res) => {
  try {
    const article = await Article.find({}, null, {
      sort: { _id: -1 },
    })
      .populate("scategorieID")
      .exec();

    res.status(200).json(article);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  const art = new Article(req.body);

  try {
    await art.save();

    res.status(200).json(art);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const art = await Article.findById(req.params.id);
    res.status(200).json(art);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  await Article.findByIdAndDelete(id);
  res.json({ message: "Article deleted successfully." });
});
router.put("/:id", async (req, res) => {
  try {
    const art = await Article.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      // new: true -> pour afficheir la nouvelle version de cat
      { new: true }
    );
    res.status(200).json(art);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});
// chercher un article
router.get("/:articleId", async (req, res) => {
  try {
    const art = await Article.findById(req.params.articleId);
    res.status(200).json(art);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});
router.get("/scat/:scategorieID", async (req, res) => {
  try {
    const art = await Article.find({
      scategorieID: req.params.scategorieID,
    }).exec();
    res.status(200).json(art);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});
router.get("/art/pagination", async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const offset = (page - 1) * limit;

  try {
    const articles = await Article.find({}, null, { sort: { _id: -1 } })
      .skip(offset)
      .limit(limit)
      .populate("scategorieID")
      .exec();
    // mt2 AVEC  countDocuments()
    const totalarticles = await Article.countDocuments();
    const totalPages = Math.ceil(totalarticles / limit);

    // mt1 AVEC find
    //const totalarticles = await Article.find({}, null, { sort: { _id: -1 } });
    //const totalPages = Math.ceil(totalarticles.length / limit);

    res.status(200).json({ articles: articles, totalPages: totalPages });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// chercher un article par cat
router.get("/cat/:categorieID", async (req, res) => {
  try {
    // Recherche des sous-catégories correspondant à la catégorie donnée
    const sousCategories = await Scategorie.find({
      categorieID: req.params.categorieID,
    }).exec();
    // Initialiser un tableau pour stocker les identifiants des sous-catégories trouvées
    const sousCategorieIDs = sousCategories.map((scategorie) => scategorie._id);
    // Recherche des articles correspondant aux sous-catégories trouvées
    const articles = await Article.find({
      scategorieID: { $in: sousCategorieIDs },
    }).exec();
    res.status(200).json(articles);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});
module.exports = router;
