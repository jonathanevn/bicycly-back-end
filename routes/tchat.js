const express = require("express");

const router = express.Router();

const isAuthenticated = require("../middlewares/isAuthenticated");
// importer les models
const BikeModel = require("../models/Bike");
const MessageModel = require("../models/Message");
const ThreadModel = require("../models/Thread");
//const UserModel = require("../models/User");

//Recuperer historique des messages
router.get("/message/:thread", function(req, res) {
  // recuperer les messages d'une discussion
  console.log("THREAD ID", req.params.thread);
  if (req.params.thread !== "undefined") {
    console.log("Thread existant", req.params.thread);
    MessageModel.find({ thread: req.params.thread })
      //recuperer d autres collections
      .populate({ path: "user" })
      .populate({ path: "thread", populate: { path: "bike" } })
      .sort({ createdAt: -1 }) //ordre des messges
      .exec((err, messages) => {
        res.send(messages);
      });
  } else {
    BikeModel.find({ _id: this.state.navigation.params.bikeId })

      .populate({ path: "user" })
      .exec(function(err, secondUser) {
        console.log("Thread non-existante", secondUser[0].user._id);
        const thread = new ThreadModel({
          users: [secondUser[0].user._id],
          bike: this.state.navigation.params.bikeId
        });
        thread.save(function(err, savedThread) {
          res.json(savedThread);
        });
      });
  }
});

module.exports = router;
