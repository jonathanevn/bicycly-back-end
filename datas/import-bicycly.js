require("dotenv").config();

const uid2 = require("uid2");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect(
  process.env.MONGODB_URI,
  function(err) {
    if (err) console.error("Could not connect to mongodb.");
  }
);

let User = require("../models/User.js");
let City = require("../models/City.js");
let Bike = require("../models/Bike.js");

let users = require("./users.json");
let cities = require("./cities.json");
let bikes = require("./bikes.json");

// users
for (let i = 0; i < users.length; i++) {
  User.register(
    new User({
      shortId: users[i].id,
      email: users[i].email.toLowerCase(),
      token: uid2(16),

      account: {
        username: users[i].username,
        description: users[i].description,
        photos: users[i].photos,
        favorites: [],
        bikes: []
      }
    }),
    "", // Le mot de passe doit être obligatoirement le deuxième paramètre transmis à `register` afin d'être crypté
    function(err, obj) {
      if (err) {
        console.error(err);
      } else {
        console.log("saved user " + obj.account.username);
      }
    }
  );
}

// cities
for (let i = 0; i < cities.length; i++) {
  let city = new City({
    source: cities[i].source,
    name: cities[i].name,
    slug: cities[i].id,
    loc: [cities[i].loc.lon, cities[i].loc.lat],
    zoom: cities[i].zoom
  });

  city.save(function(err, obj) {
    if (err) {
      console.log("error saving city " + obj.name);
    } else {
      console.log("saved city " + obj.name);
    }
  });
}

// bikes
setTimeout(function() {
  console.log("saving bikes...");

  bikes.forEach(function(bike_to_save) {
    let data = {
      id: bike_to_save.id,
      bikeBrand: bike_to_save.bikeBrand,
      bikeModel: bike_to_save.bikeModel,
      bikeCategory: bike_to_save.bikeCategory,
      pricePerDay: bike_to_save.pricePerDay,
      photos: bike_to_save.photos,
      description: bike_to_save.description,
      loc: [bike_to_save.loc.lon, bike_to_save.loc.lat],
      // temporary set
      user: bike_to_save.userId,
      city: bike_to_save.cityId
    };

    User.findOne({ shortId: data.user })
      .exec()
      .then(function(obj) {
        data.user = obj;

        City.findOne({ slug: data.city })
          .exec()
          .then(function(obj) {
            data.city = obj;

            let bike = new Bike(data);
            bike.save(function(err, obj) {
              if (err) {
                console.log("error saving bike " + obj.bikeBrand);
              } else {
                console.log("saved bike " + obj.bikeBrand);
              }
            });
          })
          .catch(function(err) {
            console.error(err);
          });
      })
      .catch(function(err) {
        console.error(err);
      });
  });
}, 5000);

setTimeout(function() {
  // add favorites
  // users
  users.forEach(function(user) {
    User.findOne({ "account.username": user.username })
      .exec()
      .then(function(userFound) {
        Bike.find({ id: { $in: user.favoriteIds } })
          .exec()
          .then(function(favorites) {
            favorites.forEach(function(favorite) {
              userFound.account.favorites.push(favorite);
            });
            userFound.save(function(err, obj) {
              if (err) {
                console.error("could not save user " + obj.account.username);
              } else {
                console.log("user favorites updated " + obj.account.username);

                Bike.find({ id: { $in: user.bikeIds } })
                  .exec()
                  .then(function(bikesOwned) {
                    bikesOwned.forEach(function(bikeOwned) {
                      userFound.account.bikes.push(bikeOwned);
                    });
                    userFound.save(function(err, obj) {
                      if (err) {
                        console.error(
                          "could not save user " + obj.account.username
                        );
                      } else {
                        console.log(
                          "user bikes updated " + obj.account.username
                        );
                      }
                    });
                  });
              }
            });
          });
      })
      .catch(function(err) {
        console.error(err);
      });
  });
}, 10000);

setTimeout(function() {
  mongoose.connection.close();
}, 15000);
