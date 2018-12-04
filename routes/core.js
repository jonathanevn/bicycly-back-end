var express = require("express");
var router = express.Router();

var Bike = require("../models/Bike.js");
var City = require("../models/City.js");

router.get("/home", function(req, res, next) {
  City.find()
    .exec()
    .then(function(cities) {
      Room.findRandom({}, {}, { limit: 3 }, function(err, bikes) {
        res.json({
          cities: cities || [],
          featured: bike || []
        });
      });
    })
    .catch(function(err) {
      res.status(400);
      return next(err.message);
    });
});

module.exports = router;
