require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const uuid = require("uuid");

mongoose.connect(process.env.MONGO_URI);

const exerciseSchema = mongoose.Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, required: true },
});
const Exercise = mongoose.model("Exercise", exerciseSchema);

const userSchema = mongoose.Schema({
  username: String,
  _id: String,
});
const User = mongoose.model("User", userSchema);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

//Creating a user
app.post("/api/users", (req, res) => {
  const username = req.body.username;
  User.findOne({ username: username })
    .then((data) => {
      res.json({ username, _id: data._id });
    })
    .catch((err) => {
      const _id = uuid.v4();
      const newUser = new User({ username: username, _id: _id });
      newUser
        .save()
        .then((data) => {
          console.log(newUser);
          res.json({ username: newUser.username, _id: newUser._id });
        })
        .catch((err) => {
          console.log(err);
        });
    });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
