const express = require("express");
let router = express.Router();

let Bike = require("../models/Bike.js");
let City = require("../models/City.js");
const isAuthenticated = require("../middlewares/isAuthenticated");
function getRadians(meters) {
  let km = meters / 1000;
  return km / 111.2;
}

router.get("/around", function(req, res, next) {
  // Latitude et longitude sont obligatoires
  if (!req.query.longitude || !req.query.latitude) {
    return next("Latitude and longitude are mandatory");
  }

  Bike.find()
    .where("loc")
    .near({
      center: [req.query.longitude, req.query.latitude],
      maxDistance: getRadians(50000)
    })
    .exec()
    .then(function(bikes) {
      return res.json(bikes);
    })
    .catch(function(err) {
      res.status(400);
      return next(err.message);
    });
});

// Paramètres reçus :
// - req.query.city obligatoire
// - req.query.skip
// - req.query.limit
// - req.query.priceMin
// - req.query.priceMax
router.get("/", function(req, res, next) {
  if (!req.query.city) {
    return next("City is mandatory");
  }

  let filter = {};
  let bikeRes = null;
  let cityRes = null;
  let countRes = null;

  City.findOne({ slug: req.query.city })
    .exec()
    .then(function(city) {
      if (!city) {
        res.status(404);
        return next("City not found");
      }

      cityRes = city;

      filter.city = city._id;
      if (
        req.query.priceMin !== undefined ||
        req.query.priceMax !== undefined
      ) {
        filter.price = {};
        if (req.query.priceMin !== undefined) {
          filter.price["$gte"] = req.query.priceMin;
        }
        if (req.query.priceMax !== undefined) {
          filter.price["$lte"] = req.query.priceMax;
        }
      }

      return Bike.find(filter)
        .count()
        .exec();
    })
    .then(function(count) {
      countRes = count;

      let query = Bike.find(filter)
        .populate("city")
        .populate({
          path: "user",
          select: "account"
        });
      if (req.query.skip !== undefined) {
        query.skip(parseInt(req.query.skip));
      }
      if (req.query.limit !== undefined) {
        query.limit(parseInt(req.query.limit));
      } else {
        // valeur par défaut de la limite
        query.limit(100);
      }

      return query.exec();
    })
    .then(function(bike) {
      bikeRes = bike;

      return res.json({
        bike: bikeRes || [],
        city: cityRes,
        count: countRes
      });
    })
    .catch(function(err) {
      res.status(400);
      return next(err.message);
    });
});
router.post("/publish", isAuthenticated, function(req, res) {
  // var photos = []; if (req.files.length) {   photos = _.map(req.files,
  // function(file) {     return file.filename;   }); }

  var obj = {
    state: req.body.state,
    bikeBrand: req.body.bikeBrand,
    bikeModel: req.body.bikeModel,
    bikeCategory: req.body.bikeCategory,
    description: req.body.description,
    photos: req.body.photos,
    accessories: req.body.accessories,
    pricePerDay: req.body.pricePerDay,
    user: req.user
  };
  var bike = new Bike(obj);
  bike.save(function(err) {
    if (!err) {
      return res.json({
        state: bike.state,
        bikeBrand: bike.bikeBrand,
        bikeModel: bike.bikeModel,
        bikeCategory: bike.bikeCategory,
        pricePerDay: bike.pricePerDay,
        photos: bike.photos,
        description: bike.description,
        accessories: bike.accessories,
        created: bike.created,
        user: {
          account: bike.user.account,
          _id: bike.user._id
        }
      });
    } else {
      return next(err.message);
    }
  });
});
router.get("/:id", function(req, res, next) {
  Bike.findById(req.params.id)
    .populate("city")
    // IMPORTANT SÉCURITÉ
    // Les informations sensibles de l'utilisateur étant stockées à la racine de l'objet, il est important de transmettre uniquement `account`
    .populate({
      path: "user",
      select: "account"
    })
    .exec()
    .then(function(bike) {
      if (!bike) {
        res.status(404);
        return next("bike not found");
      }

      return res.json(bike);
    })
    .catch(function(err) {
      res.status(400);
      return next(err.message);
    });
});

module.exports = router;
