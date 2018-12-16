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
  console.log("params", req.params);
  ThreadModel
    // .find({ users: req.params.userId, users: req.params.propId })
    // .find({ users: { $all: [req.params.userId, req.params.propId] } })
    .find({ owner: req.params.propId, user: req.params.userId })
    .exec((err, foundThread) => {
      res.json(foundThread);
    });
});

//Récupérer l'id du propriétaire
// router.get("/:bikeId", function(req, res) {
//   BikeModel.find({ _id: req.params.bikeId })
//     .populate({ path: "user", select: "_id" })
//     .exec(function(err, bike) {
//       ThreadModel.find({ bike: req.params.bikeId }).exec(
//         (err,
//         thread => {
//           if (thread) {
//             res.json({
//               ...bike,
//               thread: {
//                 ...thread
//               }
//             });
//           } else {
//             res.json({
//               ...bike,
//               thread: null
//             });
//           }
//         })
//       );
//     });
// });

//Recuperer historique des messages
router.get("/message/:bikeId/:userId/:thread?", function(req, res) {
  // recuperer les messages d'une discussion
  if (req.params.thread !== undefined) {
    console.log("Thread existante, son ID ===>", req.params.thread);
    MessageModel.find({ thread: req.params.thread })
      //recuperer d autres collections
      .populate({ path: "user" })
      .populate({ path: "thread", populate: { path: "bike" } })
      .sort({ createdAt: -1 }) //ordre des messges
      .exec((err, messages) => {
        BikeModel.findOne({ _id: req.params.bikeId })
          .populate({ path: "user" })
          .exec(function(err, bike) {
            res.json({
              messages: messages,
              bike: bike
            });
          });
      });
  } else {
    BikeModel.findOne({ _id: req.params.bikeId })
      .populate({ path: "user" })
      .exec(function(err, bike) {
        console.log(
          "Thread non-existante, id du propriétaire du vélo ====>",
          bike.user._id
        );
        const thread = new ThreadModel({
          user: req.params.userId,
          owner: bike.user._id,
          bike: req.params.bikeId
        });
        thread.save(function(err, savedThread) {
          res.json(savedThread);
        });
      });
  }
});

module.exports = router;
