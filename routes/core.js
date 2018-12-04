let express = require("express");
let router = express.Router();

let Bike = require("../models/Bike.js");
let City = require("../models/City.js");

router.get("/home", function(req, res, next) {
  City.find()
    .exec()
    .then(function(cities) {
      Bike.findRandom({}, {}, { limit: 3 }, function(err, bikes) {
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
