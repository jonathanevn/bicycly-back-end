const express = require("express");
const router = express.Router(); // Initialiser un serveur

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const isAuthenticated = require("../middlewares/isAuthenticated");

const User = require("../models/User.js");

router.post("/sign_up", function(req, res) {
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

  newUser.save(function(err, createdUser) {
    if (err) {
      res.json({ error: err.message });
    } else {
      res.json(createdUser);
    }
  });
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

// L'authentification est obligatoire pour cette route
router.get("/:id", isAuthenticated, function(req, res, next) {
  User.findById(req.params.id)
    .select("account")
    // .populate("account.bikes")
    .exec()
    .then(function(user) {
      if (!user) {
        res.status(404);
        return next("User not found");
      }

      return res.json({
        _id: user._id,
        account: user.account
      });
    })
    .catch(function(err) {
      res.status(400);
      return next(err.message);
    });
});

module.exports = router;
