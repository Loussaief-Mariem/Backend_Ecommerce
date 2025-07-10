// express pour les route
// faire appelle ou module express
const express = require("express");
// faire appelle ou module mongoose
const mongoose = require("mongoose");
// permet utiliser le process.env.PORT
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
// partei de l'IA
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { HumanMessage } = require("@langchain/core/messages");
// Création du modèle Gemini
const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-2.0-flash",
  // ou "models/chat-bison-001"
  temperature: 0.7,
});
// Obtenir les collections disponibles
async function getCollections() {
  try {
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    return collections.map((col) => col.name);
  } catch (error) {
    console.error("Erreur lors de la récupération des collections:", error);
    return [];
  }
}
// Extraire le JSON depuis la réponse du modèle
function extractJSON(text) {
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("Aucun JSON détecté");
    const jsonStr = text.substring(start, end + 1);
    return JSON.parse(jsonStr);
  } catch (err) {
    console.warn("Erreur lors de l'extraction du JSON:", err.message);
    return null;
  }
}
// Analyse de l'intention de l'utilisateur
async function analyzeIntent(userQuestion) {
  const availableCollections = await getCollections();
  console.log("Collections disponibles:", availableCollections);
  const prompt = ` Tu es un assistant qui analyse des questions en français et génère des requêtes MongoDB. Collections disponibles: ${availableCollections.join(
    ", "
  )}. Réponds uniquement avec un objet JSON comme : { "intent": "list|search|aggregate", "collection": "nom_collection", "query": {} } Pour un maximum, utilise : { "intent": "aggregate", "collection": "nom_collection", "query": [ { "$sort": { "qtestock": -1 } }, { "$limit": 1 } ] } Question: ${userQuestion} `;
  try {
    console.log("Envoi du prompt à Gemini...");
    const response = await model.call([new HumanMessage(prompt)]);
    console.log("Réponse brute du modèle:", response.content);
    const analysis = extractJSON(response.content);
    if (!analysis) throw new Error("JSON non analysable");
    if (
      !analysis.collection ||
      !availableCollections.includes(analysis.collection)
    ) {
      console.warn(
        "Collection invalide ou non spécifiée:",
        analysis.collection
      );
      analysis.collection = availableCollections.includes("articles")
        ? "articles"
        : availableCollections[0];
      console.log(
        "Utilisation de la collection par défaut:",
        analysis.collection
      );
    }
    return analysis;
  } catch (error) {
    console.error("Erreur lors de l'analyse:", error.message);
    return { intent: "list", collection: "articles", query: {} };
  }
}

// importer le ficheir categorie.route
const categorieRouter = require("./routes/categorie.route");
/** $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ */
const scategorieRouter = require("./routes/scategorie.route");
const articleRouter = require("./routes/article.route");
const app = express();
// pour comprendre le req.body
app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
  res.send("Hello world ! ");
});
app.get("/contact", (req, res) => {
  res.send("page de contact ");
});
// send : afffiche un message page web a user
app.get("/help", (req, res) => {
  res.send("page d'aide ");
});
/*Connexion à la base données cloud atles
mongoose
  .connect(process.env.DATABASECLOUD)
  .then(() => {
    console.log("DataBase Successfully Connected");
  })
  .catch((err) => {
    console.log("Unable to connect to database", err);
    process.exit();
  }); */
// Connexion à la base données local
// avec process.env  je peut acceder a la variable dasn la fichier .env : contient les variable d'envirenement : les parametre d'acces a base de données
mongoose
  .connect(process.env.DATABASECLOUD)
  .then(() => {
    console.log("DataBase Successfully Connected");
  })
  .catch((err) => {
    console.log("Unable to connect to database", err);
    process.exit();
  });
//process : methode dans dotenv
// dotenv : process : pour acceder a la varible port
// les 2 barre ken ma9ach varaible PORT bch yest3mel port 3000 ( || : ou )

/** $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ */
// a patir de la route /api/categories pour executer le fichier categorie.route
app.use("/api/categories", categorieRouter);
app.use("/api/scategories", scategorieRouter);
app.use("/api/articles", articleRouter);
const paymentRouter = require("./routes/payment.route");
app.use("/api/payment", paymentRouter);
// Endpoint principal
app.post("/api/chatbot", async (req, res) => {
  const { question } = req.body;
  console.log("Question reçue:", question);
  try {
    const analysis = await analyzeIntent(question);
    const db = mongoose.connection.db;
    const collection = db.collection(analysis.collection);
    let results;
    if (analysis.intent === "aggregate" && Array.isArray(analysis.query)) {
      results = await collection.aggregate(analysis.query).toArray();
    } else if (analysis.intent === "search" || analysis.intent === "list") {
      results = await collection.find(analysis.query).toArray();
    } else {
      throw new Error("Type de requête non supporté");
    }
    res.json({ question, resultats: results });
  } catch (err) {
    console.error("Erreur dans /api/chatbot:", err.message);
    res.status(500).json({ error: "Erreur lors du traitement de la question" });
  }
});
// Route d'API pour le chatbot
app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;
  try {
    const response = await model.call([new HumanMessage(userMessage)]);
    res.json({ reply: response.content });
  } catch (err) {
    console.error("Erreur Gemini :", err);
    res.status(500).json({ error: "Erreur du chatbot" });
  }
});
const PORT = process.env.PORT || 3000;
// console.log : afficheir un message sur le console

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
module.exports = app;
