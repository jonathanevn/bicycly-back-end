require("dotenv").config();

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect(
  process.env.MONGODB_URI,
  {
    useNewUrlParser: true
  },
  function(err) {
    if (err) console.error("Could not connect to mongodb.");
  }
);
const http = require("http");
const WebSocket = require("ws");
const express = require("express");
const app = express();

const helmet = require("helmet");
app.use(helmet());

const compression = require("compression");
app.use(compression());

const bodyParser = require("body-parser");
app.use(bodyParser.json({ limit: "50mb" }));

//initialisation des modèles

const User = require("./models/User");
const Bike = require("./models/Bike");
const City = require("./models/City");
const Thread = require("./models/Thread");
const Message = require("./models/Message");

app.get("/", function(req, res) {
  res.send("Welcome to the Bicycly API.");
});

const cors = require("cors");
app.use("/api", cors());

const coreRoutes = require("./routes/core.js");
const userRoutes = require("./routes/user.js");
const bikeRoutes = require("./routes/bike.js");
const tchatRoutes = require("./routes/tchat.js");

app.use("/api", coreRoutes);
app.use("/api/user", userRoutes);
app.use("/api/bike", bikeRoutes);
app.use("/api/tchat", tchatRoutes);

//------------ route tchat avec WS--------------------//
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", function connection(ws, req) {
  console.log("someone is connected");
  //fonction qui se declenche quand on reçoit un message
  ws.on("message", function incoming(data) {
    try {
      const dataJSON = JSON.parse(data);
      console.log(dataJSON); // message envoyé objet {text et name}{ text: 'Test', name: 'Audrey' }

      // pour connaitre la reference user je dois chercher l'utilisateur
      // attention la recherche du user doit se faire par un token pour securiser
      User.findOne({ token: dataJSON.token }).exec((err, user) => {
        Message.find({ thread: dataJSON.thread })
          .count()
          .exec((err, count) => {
            let message;
            if (count === 0) {
              message = new Message({
                text: dataJSON.text,
                user: user,
                thread: dataJSON.thread,
                isRequest: true
              });
            } else {
              message = new Message({
                text: dataJSON.text,
                user: user,
                thread: dataJSON.thread,
                isRequest: false
              });
            }
            //asynchrone
            //si la sauvegarde fonctionne le message est envoyé à tout le monde
            message.save(err => {
              wss.clients.forEach(function each(client) {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                  if (dataJSON.text) {
                    client.send(
                      JSON.stringify({
                        // message recu par les autres participants
                        _id: message._id,
                        text: dataJSON.text,
                        user: { name: user.firstName },
                        createdAt: message.createdAt
                      })
                    );
                  }
                }
              });
            });
          });
      });
    } catch (e) {
      console.error(e.message);
    }
  });
});

// Toutes les méthodes HTTP (GET, POST, etc.) des pages non trouvées afficheront
// une erreur 404
app.all("*", function(req, res) {
  res.status(404).json({ error: "Not Found" });
});

app.use(function(err, req, res, next) {
  if (res.statusCode === 200) res.status(400);
  console.error(err);

  // if (process.env.NODE_ENV === "production") err = "An error occurred";
  res.json({ error: err });
});

server.listen(process.env.PORT, function() {
  console.log(`bicycly running on port ${process.env.PORT}`);
});
