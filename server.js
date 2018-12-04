require("dotenv").config();

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect(
  process.env.MONGODB_URI,
  {
    useNewUrlParser: true
  },
  function(err) {
    if (err) console.error("Could not connect to mongodb.");
  }
);

const express = require("express");
const app = express();

const helmet = require("helmet");
app.use(helmet());

const compression = require("compression");
app.use(compression());

const bodyParser = require("body-parser");
app.use(bodyParser.json());

//initialisation des modèles

const User = require("./models/User");
const Bike = require("./models/Bike");
const City = require("./models/City");

app.get("/", function(req, res) {
  res.send("Welcome to the Bicycly API.");
});

const cors = require("cors");
app.use("/api", cors());

const coreRoutes = require("./routes/core.js");
const userRoutes = require("./routes/user.js");
const bikeRoutes = require("./routes/bike.js");

app.use("/api", coreRoutes);
app.use("/api/user", userRoutes);
app.use("/api/room", bikeRoutes);

// Toutes les méthodes HTTP (GET, POST, etc.) des pages non trouvées afficheront
// une erreur 404
app.all("*", function(req, res) {
  res.status(404).json({ error: "Not Found" });
});

app.use(function(err, req, res, next) {
  if (res.statusCode === 200) res.status(400);
  console.error(err);

  // if (process.env.NODE_ENV === "production") err = "An error occurred";
  res.json({ error: err });
});

app.listen(process.env.PORT, function() {
  console.log(`bicycly running on port ${process.env.PORT}`);
});
