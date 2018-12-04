const express = require("express");
const router = express.Router(); // Initialiser un serveur

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

// const isAuthenticated = require("../middlewares/isAuthenticated");

const User = require("../models/User.js");

router.post("/sign_up", function(req, res) {
  const newUser = new UserSchema(req.body);
  const password = req.body.password;
  const token = uid2(16);
  const salt = uid2(16);
  const hash = SHA256(password + salt).toString(encBase64);

  newUser.account.username = req.body.username;
  newUser.account.address = req.body.address;
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

// Démarrer le serveur
const port = 3000;
app.listen(port, function() {
  console.log("Server started");
});
