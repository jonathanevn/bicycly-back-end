const express = require("express");

const router = express.Router();

const isAuthenticated = require("../middlewares/isAuthenticated");
// importer les models
const BikeModel = require("../models/Bike");
const MessageModel = require("../models/Message");
const ThreadModel = require("../models/Thread");
const UserModel = require("../models/User");

//On check si une thread existe déjà entre ces deux utilisateurs
router.get("/thread/:userId/:propId", function(req, res) {
  ThreadModel.find({ users: req.params.userId, users: req.params.propId }).exec(
    (err, foundThread) => {
      console.log(foundThread);
      res.send(foundThread);
    }
  );
});

//Récupérer l'id du propriétaire
router.get("/:bikeId", function(req, res) {
  BikeModel.find({ _id: req.params.bikeId })
    .populate({ path: "user", select: "_id" })
    .exec(function(err, proprioId) {
      res.send(proprioId);
    });
});

//Recuperer historique des messages
router.get("/message/:bikeId/:userId/:thread?", function(req, res) {
  // recuperer les messages d'une discussion
  if (req.params.thread !== "undefined") {
    console.log("Thread existante, son ID ===>", req.params.thread);
    MessageModel.find({ thread: req.params.thread })
      //recuperer d autres collections
      .populate({ path: "user" })
      .populate({ path: "thread", populate: { path: "bike" } })
      .sort({ createdAt: -1 }) //ordre des messges
      .exec((err, messages) => {
        res.send(messages);
      });
  } else {
    BikeModel.find({ _id: req.params.bikeId })
      .populate({ path: "user" })
      .exec(function(err, secondUser) {
        console.log(
          "Thread non-existante, id du propriétaire du vélo ====>",
          secondUser[0].user._id
        );
        const thread = new ThreadModel({
          users: [secondUser[0].user._id, req.params.userId],
          bike: req.params.bikeId
        });
        thread.save(function(err, savedThread) {
          res.send(savedThread);
        });
      });
  }
});

module.exports = router;
