const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
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
    description: {
      type: String,
      minlength: 1,
      maxlength: 100
    }
  },

  //   buyingOptions: String,

  token: String,
  hash: String,
  salt: String,
  ratingValue: Number,
  reviews: Number
});

module.exports = mongoose.model("User", UserSchema, "users");
