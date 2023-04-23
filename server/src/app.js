const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");

const api = require("./routes/api");

const app = express();

//------------------------MIDDLEWARE START-----------------------------------------------------

//it is a functio n that returns cors middleware
//it has an options object in which we declare to which http request we want to allow our cross origin policy..
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

//Morgan is an HTTP request logger middleware for Node.js applications.
//It logs information about each incoming request, including the request method, URL, status code, and response time.
// It can be used to debug and monitor the traffic of a Node.js application, and to identify performance issues or errors.
app.use(morgan("combined"));

//parse any incoming json
app.use(express.json());
//serving client code and server code for production through API
app.use(express.static(path.join(__dirname, "..", "public")));

//how to add versions after an endpoint
//for example in this link:-https://api.spacexdata.com/v5/launches/latest
///v5 is the version and all the endpoints after this means that they all lie in version 5 of spacex datat

app.use("/v1", api);
//-------------------------------------MIDDLEWARE CLOSED--------------------------------------------------------

/*When we go to the root route, we specifically had to mention "/index.html" but we specified here that on the root route
we have to load the index.html page*/
// it's important to distinguish between front end routing and back end routing here.
// If we want front end routing in React using the HTML5 pushState API,
// we need to make our back end express router aware of this.
// So when we navigate to /upcoming for example,
// Express with the * will say "Ok, I'll just forward this request to React, and React can handle the front end routing".
// But it will always go through Express and the Express router first, so we need that *.
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

module.exports = app;
