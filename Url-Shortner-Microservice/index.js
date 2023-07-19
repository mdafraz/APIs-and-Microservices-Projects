require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// Basic Configuration

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const schema = new mongoose.Schema({
  original_url: String,
  short_url: Number,
});
const Url = mongoose.model("Url", schema);

const port = process.env.PORT;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
const validUrl = (str) => {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + //  protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + //  domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + //  OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + //  port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); //fragment locator
  return pattern.test(str);
};

app.post("/api/shorturl", (req, res) => {
  const original_url = req.body.url;
  if (validUrl(original_url)) {
    Url.findOne({ original_url: req.body.url }).then((data) => {
      console.log(data);
      if (data) {
        //url found
        console.log("url found");
        res.json({ original_url: original_url, short_url: data.short_url });
      } else {
        //url not found , new url
        console.log("url not found");
        let newUrl = new Url({
          original_url: original_url,
          short_url: new Date(),
        });

        newUrl
          .save()
          .then((data) => {
            res.json({
              original_url: original_url,
              short_url: newUrl.short_url,
            });
          })
          .catch((err) => {
            if (err) {
              console.log(err);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  } else {
    res.json({ error: "invalid url" });
  }
});

app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
