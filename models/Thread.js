const mongoose = require("mongoose");

const ThreadModel = mongoose.model("Thread", {
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  bike: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bike"
  },
  status: {
    type: String,
    enum: ["Requested", "Accepted", "Declined"],
    default: "Requested"
  }
});

module.exports = ThreadModel;
