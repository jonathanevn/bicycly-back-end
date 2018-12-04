var mongoose = require("mongoose");
// Le package `mongoose-simple-random` permet de récupérer aléatoirement des documents dans une collection
var random = require("mongoose-simple-random");

var BikeSchema = new mongoose.Schema({
  shortId: Number,
  conditionState: String,
  brand: String,
  bikeClass: String,
  typeOfBike: String,
  price: Number,
  photos: [String],
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
