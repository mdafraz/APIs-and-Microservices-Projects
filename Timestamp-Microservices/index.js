// index.js
// where your node app starts

// init project
require("dotenv").config();
var express = require("express");
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require("cors");
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

// your first API endpoint...

const getDate = (param) => {
  const date = param ? new Date(param) : new Date();
  const unix = date.getTime();
  const utc = date.toUTCString();
  console.log("date: ", date);
  if (unix == "null" || utc == "Invalid Date") {
    return { error: "Invalid Date" };
  }
  return { unix, utc };
};

app.get("/api/", (req, res) => {
  const DATE = getDate();
  res.json(DATE);
});

app.get("/api/:date", function (req, res) {
  const param = req.params.date || "hello";
  console.log("param :", param);
  const valid = +param;
  const DATE = isNaN(valid) ? getDate(param) : getDate(valid);
  res.json(DATE);
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + process.env.PORT);
});
