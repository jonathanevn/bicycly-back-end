const mongoose = require("mongoose");

const UserSchema = mongoose.Schema("User", {
  lastName: {
    type: String,
    required: true
  },
  firstName: {
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
    address: {
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

module.exports = mongoose.Schema("User", UserSchema, "users");
