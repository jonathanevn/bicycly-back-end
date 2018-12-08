const express = require("express");
const app = express;

const stripe = require("stripe")(process.env.STRIPE_API_KEY_TEST);
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.post("/api/", (req, res) => {
  if (req.body.token) {
    console.log(req.body.token);
    const { name } = req.body.token.card;

    stripe.charges.create(
      {
        amount: req.body.amount,
        currency: "eur",
        source: req.body.token.id,
        description: `Charge for ${name}`,
        metadata: { order_id: 6735 }
      },
      function(err, charge) {
        console.log(err, charge);
        if (charge.status === "succeeded") {
          return res.status(200).json("Payment succeed");
        }
      }
    );
  } else {
    console.log("Aucun Token transmis");
  }
});

app.listen(3200, () => {
  console.log("server is up!");
});
