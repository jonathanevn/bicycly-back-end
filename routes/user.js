const express = require("express");
const router = express.Router(); // Initialiser un serveur

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const isAuthenticated = require("../middlewares/isAuthenticated");
const uploadPictures = require("../middlewares/uploadPictures");

const User = require("../models/User.js");
const Thread = require("../models/Thread.js");

router.post("/sign_up", function(req, res, next) {
  const newUser = new User(req.body);
  const password = req.body.password;
  const token = uid2(16);
  const salt = uid2(16);
  const hash = SHA256(password + salt).toString(encBase64);
  // creation du compte : les 5 champs required + token/salt/hash
  newUser.lastName = req.body.lastName;

  newUser.firstName = req.body.firstName;
  newUser.email = req.body.email;
  newUser.token = token;
  newUser.hash = hash;
  newUser.salt = salt;

  if (!req.body.password) {
    return res.status(400).json({ error: "password is missing" });
  } else {
    newUser.save(function(err, createdUser) {
      if (err) {
        return next({ error: err.message });
      } else {
        return res.json(createdUser);
      }
    });
  }
});

router.post("/log_in", function(req, res) {
  User.findOne({ email: req.body.email }).exec(function(err, myAccount) {
    if (err) {
      return res.status(400).json({ error: err.message });
    } else if (myAccount === null) {
      // vérification de l'existence de l'e-mail
      return res.status(400).json({ error: "email doesn't exist" });
    } else {
      const userInfo = { account: {} };
      const password = req.body.password;
      const salt = myAccount.salt;
      const reqHash = SHA256(password + salt).toString(encBase64); // salage et cryptage du password entré
      if (reqHash === myAccount.hash) {
        // comparaison password(encrypté) entré avec password(encrypté) stocké
        userInfo._id = myAccount._id;
        userInfo.token = myAccount.token;
        userInfo.account.username = myAccount.account.username;
        return res.status(200).json(userInfo);
      } else {
        return res.status(400).json({ error: "login is not correct" });
      }
    }
  });
});

router.post("/update", isAuthenticated, uploadPictures, function(
  req,
  res,
  next
) {
  User.findOne({ token: req.user.token }).exec(function(err, user) {
    console.log(req.user.token);
    if (user) {
      user.email = req.body.email;
      user.account.phone = req.body.phone;
      user.account.photos = req.pictures || user.account.photos;

      user.save(function(err, savedUser) {
        console.log(err, savedUser);
        res.status(200).json(savedUser);
      });
    }
  });
});

// L'authentification est obligatoire pour cette route
router.get("/:id", isAuthenticated, function(req, res, next) {
  User.findById(req.params.id)
    // .select("account")
    // .populate("account.bikes")
    .exec()
    .then(function(user) {
      if (!user) {
        res.status(404);
        return next("User not found");
      }

      return res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        account: user.account,
        reviews: user.reviews,
        ratingValue: user.ratingValue,
        email: user.email
      });
    })
    .catch(function(err) {
      res.status(400);
      return next(err.message);
    });
});

//recherche des threads liées aux vélos du propriétaire
router.get("/anyThread/:id", isAuthenticated, function(req, res, next) {
  Thread.find({ $or: [{ owner: req.params.id }, { user: req.params.id }] })
    .populate({ path: "bike" })
    .exec((err, foundBikes) => {
      res.json(foundBikes);
    });
  // .catch(function(err) {
  //   res.status(400).json(err);
  // });
});

// router.get("/anyThread", function(req, res, next) {
//   Thread.find()
// })

module.exports = router;
