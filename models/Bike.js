let mongoose = require("mongoose");
// Le package `mongoose-simple-random` permet de récupérer aléatoirement des documents dans une collection
let random = require("mongoose-simple-random");

let BikeSchema = new mongoose.Schema({
  id: Number,
  state: String,
  bikeBrand: String,
  bikeModel: String,
  bikeCategory: String,
  pricePerDay: Number,
  photos: {
    required: true,
    type: [String]
  },
  description: String,
  accessories: {
    type: Array,
    default: undefined
  },
  loc: {
    type: [Number], // Longitude et latitude
    index: "2d" // Créer un index geospatial https://docs.mongodb.com/manual/core/2d/
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "City"
  }
});

BikeSchema.plugin(random);

module.exports = mongoose.model("Bike", BikeSchema, "bikes");
