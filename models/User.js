const mongoose = require("mongoose");

const UserModel = mongoose.model("User", {
  nom: {
    type: String,
    required: true
  },
  prenom: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  account: {
    username: {
      type: String,
      required: true,
      unique: true
    },
    adress: {
      type: String,
      required: true
    },
    profilePicture: {
      required: false,
      type: [String]
    },
    bikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bike"
      }
    ],
    activity: String,
    bikeRents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rent"
      }
    ],
    description: String
  },

  //   buyingOptions: String,

  token: String,
  hash: String,
  salt: String,
  ratingValue: Number,
  reviews: Number
});
