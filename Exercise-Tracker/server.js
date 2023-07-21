require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const uuid = require("uuid");

mongoose.connect(process.env.MONGO_URI);

const exerciseSchema = mongoose.Schema({
  userId: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true, min: 1 },
  date: { type: Date },
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
          res.json({ username: newUser.username, _id: newUser._id });
        })
        .catch((err) => {
          console.log(err);
        });
    });
});

app.get("/api/users", (req, res) => {
  User.find().then((data) => {
    res.json(data);
  });
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  try {
    const date = req.body.date ? new Date(req.body.date) : new Date();

    const newExercise = new Exercise({
      userId: req.params._id,
      description: req.body.description,
      duration: req.body.duration,
      date: date,
    });

    const exercise = await newExercise.save();

    const user = await User.findOne({ _id: req.params._id });
    res.json({
      username: user.username,
      _id: user["_id"],
      date: exercise.date.toDateString(),
      duration: exercise.duration,
      description: exercise.description,
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
});

app.get("/api/users/:_id/logs/", async (req, res) => {
  try {
    const { from, to, limit } = req.query;

    const user = await User.findOne({ _id: req.params._id });
    const logQuery = { userId: user._id };

    if (from && to) {
      logQuery.date = { $gte: new Date(from), $lte: new Date(to) };
    }

    const logs = await Exercise.find(logQuery).limit(
      Number(limit) || undefined
    );

    const mappedLogs = logs.map((item) => ({
      description: item.description,
      duration: item.duration,
      date: item.date.toDateString(),
    }));

    const result = {
      _id: user._id,
      username: user.username,
      count: logs.length,
      logs: mappedLogs,
    };

    return res.json(result);
  } catch (err) {
    console.log(err);
    throw err;
  }
});

app.get("/", async (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
