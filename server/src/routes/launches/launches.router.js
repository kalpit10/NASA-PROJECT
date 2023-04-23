const express = require("express");
const {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
} = require("./launches.controller");

const launchesRouter = express.Router();

//get all of our launches calling a function getAllLaunches
launchesRouter.get("/launches", httpGetAllLaunches);
launchesRouter.post("/launches", httpAddNewLaunch);
launchesRouter.delete("/launches/:id", httpAbortLaunch);

module.exports = launchesRouter;
